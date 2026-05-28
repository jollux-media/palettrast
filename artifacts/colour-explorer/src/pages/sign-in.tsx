import { RedirectToSignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 text-slate-700">
      <RedirectToSignIn />
      Redirecting to sign in...
    </div>
  );
}
