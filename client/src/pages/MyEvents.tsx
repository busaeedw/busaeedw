import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Calendar, MapPin, Eye, Edit, Plus, CalendarCheck } from 'lucide-react';
import { useEffect } from 'react';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function MyEvents() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: userEvents, isLoading: eventsLoading, error: eventsError } = useQuery<any[]>({
    queryKey: ['/api/user/events'],
    enabled: isAuthenticated && user?.role === 'organizer',
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t('common.unauthorized'),
        description: t('common.unauthorized.desc'),
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, toast, setLocation, t]);

  useEffect(() => {
    if (eventsError && isUnauthorizedError(eventsError)) {
      toast({
        title: t('common.unauthorized'),
        description: t('common.unauthorized.desc'),
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [eventsError, toast, setLocation, t]);

  if (authLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="bg-white dark:bg-gray-800">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg animate-pulse" />
                <CardContent className="p-6">
                  <LoadingSkeleton lines={4} />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
      cultural: 'bg-gold-100 text-gold-700 dark:bg-gold-900 dark:text-gold-300',
      business: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('myEvents.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t('myEvents.subtitle')}</p>
          </div>
          <Button asChild className="bg-saudi-green hover:bg-saudi-green/90" data-testid="button-create-event">
            <Link href="/events/create">
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.createEvent')}
            </Link>
          </Button>
        </div>

        {/* Events Grid */}
        {userEvents && userEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEvents.map((event: any) => (
              <Card
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                data-testid={`card-event-${event.id}`}
              >
                <div className="relative">
                  <img
                    src={event.imageUrl || "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                    alt={language === 'ar' && event.titleAr ? event.titleAr : event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant={event.status === 'published' ? 'default' : 'secondary'}
                      className="capitalize"
                      data-testid={`badge-status-${event.id}`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCategoryColor(event.category)}>
                      {t(`events.filter.${event.category}`) || event.category}
                    </Badge>
                    <span className="text-gold-500 font-semibold" data-testid={`text-price-${event.id}`}>
                      {event.price === '0.00' || event.price === 0
                        ? t('events.free')
                        : `${event.currency} ${event.price}`}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2" data-testid={`text-title-${event.id}`}>
                    {language === 'ar' && event.titleAr ? event.titleAr : event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="mr-4" data-testid={`text-date-${event.id}`}>
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <MapPin className="h-4 w-4 mr-2" />
                    <span data-testid={`text-location-${event.id}`}>
                      {t(`venues.city.${event.city?.toLowerCase()}`) || event.city}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                      data-testid={`button-view-${event.id}`}
                    >
                      <Link href={`/events/${event.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('myEvents.view')}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                      data-testid={`button-edit-${event.id}`}
                    >
                      <Link href={`/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('myEvents.edit')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-12">
            <CalendarCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('myEvents.noEvents.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t('myEvents.noEvents.subtitle')}
            </p>
            <Button asChild className="bg-saudi-green hover:bg-saudi-green/90" data-testid="button-create-first-event">
              <Link href="/events/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('myEvents.createFirst')}
              </Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
