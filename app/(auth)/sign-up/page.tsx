import type { Metadata } from "next";

import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign up · Packly",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.025em]">
          Create your account
        </h1>
        <p className="text-[15px] text-balance text-muted">
          Plan what to wear, eat and pack, one day at a time.
        </p>
      </div>

      <AuthForm mode="sign-up" action={signUp} />
    </div>
  );
}
