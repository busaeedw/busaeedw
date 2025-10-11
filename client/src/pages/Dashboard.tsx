import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/loading';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  CalendarCheck, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Plus,
  Settings,
  Eye,
  Edit,
  Home,
  Search,
  Building2
} from 'lucide-react';
import { isUnauthorizedError } from '@/lib/authUtils';
import { type Event, type EventRegistration, type Message } from '@shared/schema';

type VenueWithStats = {
  id: string;
  name: string;
  nameAr?: string | null;
  city: string;
  location: string;
  eventCount: number;
};

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('common.unauthorized'),
        description: t('common.unauthorized.desc'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: userEvents, isLoading: eventsLoading, error: eventsError } = useQuery<Event[]>({
    queryKey: ['/api/user/events'],
    enabled: isAuthenticated && (user?.role === 'organizer' || user?.role === 'admin'),
    retry: false,
  });

  const { data: userRegistrations, isLoading: registrationsLoading, error: registrationsError } = useQuery<EventRegistration[]>({
    queryKey: ['/api/user/registrations'],
    enabled: isAuthenticated && (user?.role === 'attendee' || user?.role === 'admin'),
    retry: false,
  });

  const { data: conversations, isLoading: conversationsLoading, error: conversationsError } = useQuery<Message[]>({
    queryKey: ['/api/conversations'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: userVenues, isLoading: venuesLoading, error: venuesError } = useQuery<VenueWithStats[]>({
    queryKey: ['/api/user/venues'],
    enabled: isAuthenticated && user?.role === 'venues',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [eventsError, registrationsError, conversationsError, venuesError].filter(Boolean);
    errors.forEach(error => {
      if (error && isUnauthorizedError(error)) {
        toast({
          title: t('common.unauthorized'),
          description: t('common.unauthorized.desc'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    });
  }, [eventsError, registrationsError, conversationsError, venuesError, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner className="mx-auto" size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const renderOrganizerDashboard = () => (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.myEvents')}</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.totalEventsCreated')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalAttendees')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.acrossAllEvents')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.messages')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.activeConversations')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('dashboard.recentEvents')}</CardTitle>
            <Button asChild size="sm">
              <Link href="/events/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.createEvent')}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <LoadingSkeleton lines={3} />
            ) : userEvents && userEvents.length > 0 ? (
              <div className="space-y-4">
                {userEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">
                        {language === 'ar' && event.titleAr ? event.titleAr : event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString()} • {event.city}
                      </p>
                      <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/events/${event.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No events created yet</p>
                <Button asChild>
                  <Link href="/events/create">Create Your First Event</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start" variant="outline" data-testid="button-homepage">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                {t('dashboard.goToHomepage')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline" data-testid="button-search-venues">
              <Link href="/venues">
                <Search className="h-4 w-4 mr-2" />
                {t('dashboard.searchVenues')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/events/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.createNewEvent')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/events">
                <CalendarCheck className="h-4 w-4 mr-2" />
                {t('dashboard.manageEvents')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('dashboard.viewMessages')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/profile">
                <Settings className="h-4 w-4 mr-2" />
                {t('dashboard.profileSettings')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderAttendeeDashboard = () => (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Events</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRegistrations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Upcoming events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Past events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.messages')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.activeConversations')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {registrationsLoading ? (
              <LoadingSkeleton lines={3} />
            ) : userRegistrations && userRegistrations.length > 0 ? (
              <div className="space-y-4">
                {userRegistrations.slice(0, 3).map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('dashboard.eventDetails')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.ticket')} {registration.ticketCode}
                      </p>
                      <Badge variant={registration.status === 'registered' ? 'default' : 'secondary'}>
                        {registration.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t('dashboard.noRegisteredEvents')}</p>
                <Button asChild>
                  <Link href="/events">{t('dashboard.browseEventsButton')}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start" variant="outline" data-testid="button-homepage">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                {t('dashboard.goToHomepage')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline" data-testid="button-search-venues">
              <Link href="/venues">
                <Search className="h-4 w-4 mr-2" />
                {t('dashboard.searchVenues')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/events">
                <CalendarCheck className="h-4 w-4 mr-2" />
                {t('dashboard.browseEvents')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('dashboard.viewMessages')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/profile">
                <Settings className="h-4 w-4 mr-2" />
                {t('dashboard.profileSettings')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderVenueDashboard = () => {
    const totalEvents = userVenues?.reduce((sum, venue) => sum + venue.eventCount, 0) || 0;

    return (
      <>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.venueManager.myVenues')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userVenues?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.venueManager.totalVenues')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.venueManager.eventsThisYear')}</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.venueManager.acrossAllVenues')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.messages')}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.activeConversations')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.venueManager.managedVenues')}</CardTitle>
            </CardHeader>
            <CardContent>
              {venuesLoading ? (
                <LoadingSkeleton lines={3} />
              ) : userVenues && userVenues.length > 0 ? (
                <div className="space-y-4">
                  {userVenues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`venue-card-${venue.id}`}>
                      <div className="flex-1">
                        <h3 className="font-medium" data-testid={`venue-name-${venue.id}`}>
                          {language === 'ar' && venue.nameAr ? venue.nameAr : venue.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {venue.city} • {venue.location}
                        </p>
                        <Badge variant="outline" data-testid={`venue-events-${venue.id}`}>
                          {venue.eventCount} {t('dashboard.venueManager.eventsInYear', { year: new Date().getFullYear() })}
                        </Badge>
                      </div>
                      <Button asChild size="sm" variant="outline" data-testid={`button-view-venue-${venue.id}`}>
                        <Link href={`/venues/${venue.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">{t('dashboard.venueManager.noVenues')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start" variant="outline" data-testid="button-homepage">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  {t('dashboard.goToHomepage')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline" data-testid="button-search-venues">
                <Link href="/venues">
                  <Search className="h-4 w-4 mr-2" />
                  {t('dashboard.searchVenues')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/events">
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  {t('dashboard.browseEvents')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('dashboard.viewMessages')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('dashboard.profileSettings')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcomeBack').replace('{{name}}', user?.firstName || user?.email || '')}
          </h1>
          <p className="text-gray-600 capitalize">
            {t('dashboard.dashboard').replace('{{role}}', user?.role || '')}
          </p>
        </div>

        {user?.role === 'organizer' && renderOrganizerDashboard()}
        {user?.role === 'attendee' && renderAttendeeDashboard()}
        {user?.role === 'venues' && renderVenueDashboard()}
        {user?.role === 'admin' && (
          <div className="text-center py-8">
            <Button asChild>
              <Link href="/admin">{t('dashboard.goToAdminDashboard')}</Link>
            </Button>
          </div>
        )}
        {user?.role === 'service_provider' && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('dashboard.serviceProviderComingSoon')}</p>
            <Button asChild>
              <Link href="/service-providers">{t('dashboard.viewServiceProviders')}</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
