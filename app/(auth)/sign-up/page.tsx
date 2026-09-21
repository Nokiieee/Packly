import type { Metadata } from "next";

import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign up · Packly",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b-[3px] border-ink pb-3">
        <h1 className="font-condensed text-3xl leading-none font-bold tracking-[0.02em] uppercase">
          Create account
        </h1>
        <p className="text-sm text-muted">
          Plan what to wear, eat and pack, one day at a time.
        </p>
      </div>

      <AuthForm mode="sign-up" action={signUp} />
    </div>
  );
}
