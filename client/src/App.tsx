import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MoodProvider } from "@/contexts/MoodContext";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import CanvasPage from "@/pages/CanvasPage";
import JournalPage from "@/pages/JournalPage";
import OverviewPage from "@/pages/OverviewPage";
import DiscoverPage from "@/pages/DiscoverPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/canvas" component={CanvasPage} />
      <Route path="/journal" component={JournalPage} />
      <Route path="/overview" component={OverviewPage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MoodProvider>
          <Toaster />
          <Router />
        </MoodProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
