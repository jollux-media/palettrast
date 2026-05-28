import { useEffect, useState } from "react";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { fetchRuntimeConfig } from "@/lib/runtime-config";

export default function SignUpPage() {
  const { isLoaded } = useAuth();
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    void fetchRuntimeConfig().then((config) => {
      if (config.clerkSignUpUrl) setPortalUrl(config.clerkSignUpUrl);
    });
  }, []);

  useEffect(() => {
    if (!portalUrl || isLoaded) return;

    const timeout = window.setTimeout(() => {
      window.location.assign(portalUrl);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [portalUrl, isLoaded]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4 py-8 gap-4">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/" />
      {!isLoaded && (
        <p className="text-sm text-slate-600">Loading sign up...</p>
      )}
    </div>
  );
}
