import { LogoMark } from "@/components/brand/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <LogoMark className="h-16 w-16" />
        </div>

        <div className="mt-6 rounded-[1.75rem] bg-surface px-5 pt-7 pb-6 shadow-card sm:px-7">
          {children}
        </div>
      </div>
    </div>
  );
}
