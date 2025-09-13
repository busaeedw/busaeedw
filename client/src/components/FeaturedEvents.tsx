import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSkeleton } from '@/components/ui/loading';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export function FeaturedEvents() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events?limit=6'],
  });

  const categories = [
    { id: 'all', label: t('events.filter.all'), active: true },
    { id: 'business', label: t('events.filter.business') },
    { id: 'cultural', label: t('events.filter.cultural') },
    { id: 'technology', label: t('events.filter.technology') },
    { id: 'entertainment', label: t('events.filter.entertainment') },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: 'bg-primary-100 text-primary-700',
      cultural: 'bg-gold-100 text-gold-700',
      business: 'bg-blue-100 text-blue-700',
      entertainment: 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <LoadingSkeleton lines={2} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="bg-white">
                <div className="h-48 bg-gray-200 rounded-t-lg animate-pulse" />
                <CardContent className="p-6">
                  <LoadingSkeleton lines={4} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('events.title')}
          </h2>
          <p className="text-xl text-gray-600">{t('events.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={category.active ? 'default' : 'outline'}
              className={
                category.active
                  ? 'bg-saudi-green hover:bg-saudi-green/90'
                  : 'hover:bg-primary-50'
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events && events.length > 0 ? (
            events.map((event: any) => (
              <Card
                key={event.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={event.imageUrl || "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                    <span className="text-gold-500 font-semibold">
                      {event.price === '0.00' || event.price === 0
                        ? t('events.free')
                        : `${event.currency} ${event.price}`}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="mr-4">
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.city}, Saudi Arabia</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=100&h=100&fit=face" />
                        <AvatarFallback>U1</AvatarFallback>
                      </Avatar>
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=100&h=100&fit=face" />
                        <AvatarFallback>U2</AvatarFallback>
                      </Avatar>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        +{Math.floor(Math.random() * 100)}
                      </div>
                    </div>
                    <Button
                      className="bg-saudi-green hover:bg-saudi-green/90"
                      onClick={() => {
                        if (isAuthenticated) {
                          window.location.href = `/events/${event.id}`;
                        } else {
                          window.location.href = '/api/login';
                        }
                      }}
                    >
                      {t('events.cta.view')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No events available at the moment.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="border-2 border-saudi-green text-saudi-green hover:bg-saudi-green hover:text-white transition-all"
            onClick={() => {
              if (isAuthenticated) {
                window.location.href = '/events';
              } else {
                window.location.href = '/api/login';
              }
            }}
          >
            {t('events.cta.viewall')}
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
