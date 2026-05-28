import { RedirectToSignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 text-slate-700">
      <RedirectToSignUp />
      Redirecting to sign up...
    </div>
  );
}
