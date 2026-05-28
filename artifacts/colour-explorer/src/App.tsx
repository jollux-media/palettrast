import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ColourProvider } from "@/lib/colour-context";
import { AuthContext, type AuthValue } from "@/lib/auth-context";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Home from "@/pages/home";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import NotFound from "@/pages/not-found";
import { Toaster } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { getClerkPublishableKey } from "@/lib/clerk-env";

const queryClient = new QueryClient();

const BUILD_TIME_PUBLISHABLE_KEY = getClerkPublishableKey();
const clerkAppearance = {
  variables: {
    colorPrimary: "#6366F1",
    colorBackground: "#E8ECF1",
    colorInputBackground: "#F8FAFC",
    colorInputText: "#0F172A",
    colorText: "#0F172A",
    colorTextSecondary: "#475569",
    colorDanger: "#DC2626",
    borderRadius: "0.9rem",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  elements: {
    card: {
      boxShadow: "6px 6px 14px rgba(0,0,0,0.10), -6px -6px 14px rgba(255,255,255,0.85)",
      border: "1px solid #DCE3EA",
    },
    formButtonPrimary: {
      background:
        "linear-gradient(135deg, #6366F1, #818CF8)",
      color: "#FFFFFF",
    },
    socialButtonsBlockButton: {
      border: "1px solid #CBD5E1",
      backgroundColor: "#FFFFFF",
      color: "#334155",
    },
    footerActionLink: {
      color: "#4F46E5",
      fontWeight: 600,
    },
  },
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthSync({ getToken }: { getToken: AuthValue["getToken"] }) {
  const qc = useQueryClient();
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(() => getToken());
    } else {
      setAuthTokenGetter(null);
    }
    qc.invalidateQueries({ queryKey: ["/api/schemes"] });
  }, [isSignedIn, userId, getToken, qc]);

  return null;
}

function AppContent({
  authValue,
  hasAuthConfigured,
}: {
  authValue: AuthValue;
  hasAuthConfigured: boolean;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ ...authValue, hasAuthConfigured }}>
        {hasAuthConfigured && <AuthSync getToken={authValue.getToken} />}
        <TooltipProvider>
          <ColourProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </ColourProvider>
        </TooltipProvider>
        <Toaster position="bottom-right" richColors />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

function AppWithClerk() {
  const { isSignedIn = false, isLoaded = false, getToken } = useAuth();
  const authValue: AuthValue = {
    hasAuthConfigured: true,
    isSignedIn: Boolean(isSignedIn && isLoaded),
    isLoaded,
    getToken: getToken ?? (() => Promise.resolve(null)),
  };

  return <AppContent authValue={authValue} hasAuthConfigured={true} />;
}

const defaultAuth: AuthValue = {
  hasAuthConfigured: false,
  isSignedIn: false,
  isLoaded: true,
  getToken: async () => null,
};

function App() {
  const [runtimePublishableKey, setRuntimePublishableKey] = useState<string | undefined>(
    BUILD_TIME_PUBLISHABLE_KEY,
  );
  const [isConfigResolved, setIsConfigResolved] = useState(Boolean(BUILD_TIME_PUBLISHABLE_KEY));

  useEffect(() => {
    if (BUILD_TIME_PUBLISHABLE_KEY) return;

    let cancelled = false;

    void fetch("/api/runtime-config", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { clerkPublishableKey?: string | null };
        const key = data.clerkPublishableKey?.trim();
        if (!cancelled && key) {
          setRuntimePublishableKey(key);
        }
      })
      .catch(() => {
        // Keep auth disabled when runtime config endpoint is unavailable.
      })
      .finally(() => {
        if (!cancelled) setIsConfigResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const publishableKey = useMemo(
    () => runtimePublishableKey?.trim() || undefined,
    [runtimePublishableKey],
  );

  if (!isConfigResolved) {
    return <AppContent authValue={defaultAuth} hasAuthConfigured={false} />;
  }

  if (!publishableKey) {
    return <AppContent authValue={defaultAuth} hasAuthConfigured={false} />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} appearance={clerkAppearance}>
      <AppWithClerk />
    </ClerkProvider>
  );
}

export default App;
