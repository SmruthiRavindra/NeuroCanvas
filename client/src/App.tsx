import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MoodProvider } from "@/contexts/MoodContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import CanvasPage from "@/pages/CanvasPage";
import JournalPage from "@/pages/JournalPage";
import OverviewPage from "@/pages/OverviewPage";
import DiscoverPage from "@/pages/DiscoverPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginRegisterPage from "@/pages/LoginRegisterPage";
import GuardianSetupPage from "@/pages/GuardianSetupPage";
import OnboardingPage from "@/pages/OnboardingPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/canvas" component={CanvasPage} />
      <Route path="/journal" component={JournalPage} />
      <Route path="/overview" component={OverviewPage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">NeuroCanvas</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login/register
  if (!user) {
    return <LoginRegisterPage />;
  }

  // Logged in but hasn't completed guardian setup
  if (!user.hasCompletedGuardianSetup) {
    return <GuardianSetupPage />;
  }

  // Guardian setup complete but hasn't completed onboarding
  if (!user.hasCompletedOnboarding) {
    return <OnboardingPage />;
  }

  // All onboarding complete - show main app
  return (
    <MoodProvider>
      <Router />
    </MoodProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
