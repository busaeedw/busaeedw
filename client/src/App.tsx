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
import RoleBasedHome from "@/components/RoleBasedHome";
import EventList from "@/pages/EventList";
import EventCreate from "@/pages/EventCreate";
import EventDetails from "@/pages/EventDetails";
import EventEdit from "@/pages/EventEdit";
import ServiceProviderProfile from "@/pages/ServiceProviderProfile";
import Messages from "@/pages/Messages";
import AdminDashboard from "@/pages/AdminDashboard";
import VenueList from "@/pages/VenueList";
import VenueDetails from "@/pages/VenueDetails";
import VenueEdit from "@/pages/VenueEdit";
import BrowseEvents from "@/pages/browse/BrowseEvents";
import BrowseVenues from "@/pages/browse/BrowseVenues";
import BrowseOrganizers from "@/pages/browse/BrowseOrganizers";
import BrowseProviders from "@/pages/browse/BrowseProviders";
import BrowseUsers from "@/pages/browse/BrowseUsers";
import OrganizerDetails from "@/pages/OrganizerDetails";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Authentication routes */}
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Public routes available to all users */}
      <Route path="/events" component={EventList} />
      <Route path="/events/create" component={EventCreate} />
      <Route path="/events/:id/edit" component={EventEdit} />
      <Route path="/events/:id" component={EventDetails} />
      <Route path="/organizers/:id" component={OrganizerDetails} />
      <Route path="/service-providers/:id" component={ServiceProviderProfile} />
      <Route path="/service-providers" component={EventList} />
      <Route path="/venues" component={VenueList} />
      <Route path="/venues/:id/edit" component={VenueEdit} />
      <Route path="/venues/:id" component={VenueDetails} />

      {/* Protected routes - components handle their own auth logic */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/messages" component={Messages} />
      <Route path="/profile" component={Profile} />

      {/* Browse routes */}
      <Route path="/browse/events" component={BrowseEvents} />
      <Route path="/browse/venues" component={BrowseVenues} />
      <Route path="/browse/organizers" component={BrowseOrganizers} />
      <Route path="/browse/providers" component={BrowseProviders} />
      <Route path="/browse/users" component={BrowseUsers} />

      {/* Home routes */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={RoleBasedHome} />
          <Route path="/dashboard" component={Dashboard} />
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