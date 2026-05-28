import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ColourProvider } from "@/lib/colour-context";
import { AuthContext, type AuthValue } from "@/lib/auth-context";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { getClerkPublishableKey } from "@/lib/clerk-env";

const queryClient = new QueryClient();

const PUBLISHABLE_KEY = getClerkPublishableKey();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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

function AppContent({ authValue }: { authValue: AuthValue }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        {PUBLISHABLE_KEY && <AuthSync getToken={authValue.getToken} />}
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
    isSignedIn: Boolean(isSignedIn && isLoaded),
    isLoaded,
    getToken: getToken ?? (() => Promise.resolve(null)),
  };

  const proxyUrl = import.meta.env.PROD
    ? `${window.location.origin}/api/__clerk`
    : undefined;

  return <AppContent authValue={authValue} />;
}

const defaultAuth: AuthValue = {
  isSignedIn: false,
  isLoaded: true,
  getToken: async () => null,
};

function App() {
  if (!PUBLISHABLE_KEY) {
    return <AppContent authValue={defaultAuth} />;
  }

  const proxyUrl = import.meta.env.PROD
    ? `${window.location.origin}/api/__clerk`
    : undefined;

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} {...(proxyUrl ? { proxyUrl } : {})}>
      <AppWithClerk />
    </ClerkProvider>
  );
}

export default App;
