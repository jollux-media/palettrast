export interface RuntimeConfig {
  clerkPublishableKey: string | null;
  clerkSignInUrl: string | null;
  clerkSignUpUrl: string | null;
}

let cached: RuntimeConfig | null = null;

export async function fetchRuntimeConfig(): Promise<RuntimeConfig> {
  if (cached) return cached;

  const res = await fetch("/api/runtime-config", { cache: "no-store" });
  if (!res.ok) {
    return {
      clerkPublishableKey: null,
      clerkSignInUrl: null,
      clerkSignUpUrl: null,
    };
  }

  cached = (await res.json()) as RuntimeConfig;
  return cached;
}
