import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/" />
    </div>
  );
}
