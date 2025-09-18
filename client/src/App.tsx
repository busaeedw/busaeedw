import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import EventList from "@/pages/EventList";
import EventCreate from "@/pages/EventCreate";
import EventDetails from "@/pages/EventDetails";
import ServiceProviderProfile from "@/pages/ServiceProviderProfile";
import Messages from "@/pages/Messages";
import AdminDashboard from "@/pages/AdminDashboard";
import VenueList from "@/pages/VenueList";
import VenueDetails from "@/pages/VenueDetails";
import BrowseEvents from "@/pages/browse/BrowseEvents";
import BrowseVenues from "@/pages/browse/BrowseVenues";
import BrowseOrganizers from "@/pages/browse/BrowseOrganizers";
import BrowseProviders from "@/pages/browse/BrowseProviders";
import BrowseUsers from "@/pages/browse/BrowseUsers";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes available to all users */}
      <Route path="/events" component={EventList} />
      <Route path="/events/create" component={EventCreate} />
      <Route path="/events/:id" component={EventDetails} />
      <Route path="/service-providers/:id" component={ServiceProviderProfile} />
      <Route path="/service-providers" component={EventList} />
      <Route path="/venues" component={VenueList} />
      <Route path="/venues/:id" component={VenueDetails} />
      
      {/* Browse routes */}
      <Route path="/browse/events" component={BrowseEvents} />
      <Route path="/browse/venues" component={BrowseVenues} />
      <Route path="/browse/organizers" component={BrowseOrganizers} />
      <Route path="/browse/providers" component={BrowseProviders} />
      <Route path="/browse/users" component={BrowseUsers} />
      
      {/* Authenticated routes */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/messages" component={Messages} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
