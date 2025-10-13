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
import { useLocation } from 'wouter';
import { 
  Users, 
  CalendarCheck, 
  Building, 
  TrendingUp,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Plus,
  MapPin,
  Briefcase,
  UserPlus
} from 'lucide-react';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    const isLoggingOut = localStorage.getItem('isLoggingOut') === 'true';
    
    // Clear the logout flag if it exists
    if (isLoggingOut) {
      localStorage.removeItem('isLoggingOut');
    }
    
    if (!isLoading && !isAuthenticated && !isLoggingOut) {
      toast({
        title: t('common.access.denied'),
        description: t('common.admin.required'),
        variant: "destructive",
      });
      // Redirect to homepage instead of login to prevent auto-login loop
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast, t]);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role !== 'admin') {
        toast({
          title: t('common.access.denied'),
          description: t('common.admin.required'),
          variant: "destructive",
        });
        setLocation('/dashboard');
      }
    }
  }, [user, isAuthenticated, isLoading, toast, setLocation, t]);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/stats'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: allEvents, isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ['/api/events?limit=10'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: serviceProviders, isLoading: providersLoading, error: providersError } = useQuery({
    queryKey: ['/api/service-providers?limit=10'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [statsError, eventsError, providersError].filter(Boolean);
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
  }, [statsError, eventsError, providersError, toast]);

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

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Will redirect
  }

  const getStatusColor = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.dashboard.title')}</h1>
          <p className="text-gray-600">{t('admin.dashboard.subtitle')}</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.quick.actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Button
                onClick={() => setLocation('/events/create')}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                data-testid="create-event-button"
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">{t('admin.create.event')}</span>
              </Button>

              <Button
                onClick={() => setLocation('/venues/create')}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                data-testid="create-venue-button"
              >
                <MapPin className="h-6 w-6" />
                <span className="text-sm font-medium">{t('admin.create.venue')}</span>
              </Button>

              <Button
                onClick={() => setLocation('/organizers/create')}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                data-testid="create-organizer-button"
              >
                <Briefcase className="h-6 w-6" />
                <span className="text-sm font-medium">{t('admin.create.organizer')}</span>
              </Button>

              <Button
                onClick={() => setLocation('/service-providers/create')}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
                data-testid="create-service-provider-button"
              >
                <Building className="h-6 w-6" />
                <span className="text-sm font-medium">{t('admin.create.provider')}</span>
              </Button>

              <Button
                onClick={() => setLocation('/users/create')}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
                data-testid="create-user-button"
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-sm font-medium">{t('admin.create.user')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.stats.total.events')}</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <LoadingSkeleton lines={1} />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('admin.stats.platform.wide')}</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.stats.total.users')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <LoadingSkeleton lines={1} />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalAttendees || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('admin.stats.registered.users')}</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.stats.service.providers')}</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <LoadingSkeleton lines={1} />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalProviders || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('admin.stats.active.providers')}</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.stats.growth')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">{t('admin.stats.this.month')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('admin.recent.events')}</CardTitle>
              <Button variant="outline" size="sm">
                {t('admin.recent.manage.all')}
              </Button>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <LoadingSkeleton lines={5} />
              ) : allEvents && allEvents.length > 0 ? (
                <div className="space-y-4">
                  {allEvents.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()} • {event.city}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">{t('events.notfound.title')}</p>
              )}
            </CardContent>
          </Card>

          {/* Service Providers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('admin.stats.service.providers')}</CardTitle>
              <Button variant="outline" size="sm">
                {t('admin.recent.manage.all')}
              </Button>
            </CardHeader>
            <CardContent>
              {providersLoading ? (
                <LoadingSkeleton lines={5} />
              ) : serviceProviders && serviceProviders.length > 0 ? (
                <div className="space-y-4">
                  {serviceProviders.slice(0, 5).map((provider: any) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{provider.businessName}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {provider.category}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={provider.verified ? 'default' : 'secondary'}>
                            {provider.verified ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {provider.rating || 0}★ ({provider.reviewCount || 0})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No service providers found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.quick.actions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span>{t('admin.quick.manage.users')}</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <CalendarCheck className="h-6 w-6 mb-2" />
                  <span>{t('admin.quick.review.events')}</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Building className="h-6 w-6 mb-2" />
                  <span>{t('admin.quick.verify.providers')}</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>{t('admin.quick.view.analytics')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
