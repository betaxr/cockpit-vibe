import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import Wochenplan from "./pages/Wochenplan";
import Cortex from "./pages/Cortex";
import Prozesse from "./pages/Prozesse";
import Arbeitsplaetze from "./pages/Arbeitsplaetze";
import Login from "./pages/Login";
import { withAuth } from "./components/AuthGuard";

function Router() {
  // Wrap all protected routes with auth guard; login stays public.
  const ProtectedAgents = withAuth(Agents);
  const ProtectedAgentDetail = withAuth(AgentDetail);
  const ProtectedWochenplan = withAuth(Wochenplan);
  const ProtectedCortex = withAuth(Cortex);
  const ProtectedProzesse = withAuth(Prozesse, { requireRoles: ["admin", "editor"] });
  const ProtectedArbeitsplaetze = withAuth(Arbeitsplaetze, { requireRoles: ["admin", "editor"] });

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={ProtectedAgents} />
      <Route path="/agent/:id" component={ProtectedAgentDetail} />
      <Route path="/wochenplan" component={ProtectedWochenplan} />
      <Route path="/cortex" component={ProtectedCortex} />
      <Route path="/prozesse" component={ProtectedProzesse} />
      <Route path="/arbeitsplaetze" component={ProtectedArbeitsplaetze} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
