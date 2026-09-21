import { Roundel } from "@/components/signage/roundel";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        {/* The sign: a navy head plate over a white board, one assembly. The
            head plate is bounded on four sides, so it carries the full inset
            white rule rather than the seam the bleeding plates use. */}
        <div className="bg-plate px-5 py-3.5 text-plate-ink shadow-[inset_0_0_0_3px_var(--plate-rule)]">
          <Roundel className="text-[15px]">Packly</Roundel>
        </div>

        <div className="border-[3px] border-plate border-t-0 px-5 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
