type FrontendEnv = Record<string, string | boolean | undefined>;

function readEnv(): FrontendEnv {
  return import.meta.env as unknown as FrontendEnv;
}

export function getClerkPublishableKey(): string | undefined {
  const env = readEnv();
  const value =
    (env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) ??
    (env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined) ??
    (env.CLERK_PUBLISHABLE_KEY as string | undefined);
  return value?.trim() || undefined;
}

export function hasClerkPublishableKey(): boolean {
  return Boolean(getClerkPublishableKey());
}
