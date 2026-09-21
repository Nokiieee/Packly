// Dependency-free CDP screenshot driver. Chrome's window-resize path never
// changes the viewport; Emulation.setDeviceMetricsOverride does, so media
// queries actually evaluate at the requested width.
import { writeFileSync, mkdirSync } from "node:fs";

const CDP = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = ".impeccable/review";
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  // NOTE: the signed-in tabs need a session this headless profile does not have,
  // so these point at temporary unauthenticated pages under app/(app)/ that render
  // the same view components and inherit the real chrome. Delete them after.
  { file: "mobile.png",          path: "/shot-today",   w: 390, h: 844, mobile: true },
  { file: "mobile-packing.png",  path: "/shot-packing", w: 390, h: 844, mobile: true },
  { file: "mobile-night.png",         path: "/shot-today",   w: 390, h: 844, mobile: true, dark: true },
  { file: "mobile-packing-night.png", path: "/shot-packing", w: 390, h: 844, mobile: true, dark: true },
  { file: "mobile-sign-in-night.png", path: "/sign-in",      w: 390, h: 844, mobile: true, dark: true },
  { file: "mobile-sign-in.png",  path: "/sign-in",      w: 390, h: 844, mobile: true },
  { file: "mobile-sign-up.png",  path: "/sign-up",      w: 390, h: 844, mobile: true },
  { file: "desktop.png",         path: "/shot-today",   w: 1440, h: 900, mobile: false },
  { file: "desktop-sign-in.png", path: "/sign-in",      w: 1440, h: 900, mobile: false },
];

const targets = await (await fetch(`${CDP}/json/list`)).json();
const page = targets.find((t) => t.type === "page");
if (!page) throw new Error("no page target; is Chrome up with --remote-debugging-port?");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) rej(new Error(JSON.stringify(m.error)));
    else res(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((res, rej) => { pending.set(++id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });

await send("Page.enable");
await send("Runtime.enable");

for (const s of SHOTS) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: s.dark ? "dark" : "light" }],
  });

  await send("Emulation.setDeviceMetricsOverride", {
    width: s.w, height: s.h,
    deviceScaleFactor: s.mobile ? 3 : 2,
    mobile: s.mobile,
    screenOrientation: { angle: 0, type: "portraitPrimary" },
  });

  await send("Page.navigate", { url: BASE + s.path });
  await new Promise((r) => setTimeout(r, 2200));

  // Strip Next's dev-only overlay so no dev chrome occludes the design.
  await send("Runtime.evaluate", {
    expression: `document.querySelectorAll('nextjs-portal,[data-nextjs-toast]').forEach(n=>n.remove()); document.fonts.ready.then(()=>1)`,
    awaitPromise: true,
  });
  await new Promise((r) => setTimeout(r, 600));

  const { data } = await send("Page.captureScreenshot", {
    format: "png", captureBeyondViewport: true, optimizeForSpeed: false,
  });
  writeFileSync(`${OUT}/${s.file}`, Buffer.from(data, "base64"));

  const { result } = await send("Runtime.evaluate", {
    expression: `JSON.stringify({w:innerWidth,url:location.pathname,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth})`,
    returnByValue: true,
  });
  console.log(s.file, "->", result.value);
}

ws.close();
console.log("done");
