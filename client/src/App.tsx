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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Agents} />
      <Route path="/agent/:id" component={AgentDetail} />
      <Route path="/wochenplan" component={Wochenplan} />
      <Route path="/cortex" component={Cortex} />
      <Route path="/prozesse" component={Prozesse} />
      <Route path="/arbeitsplaetze" component={Arbeitsplaetze} />
      <Route path="/login" component={Login} />
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
