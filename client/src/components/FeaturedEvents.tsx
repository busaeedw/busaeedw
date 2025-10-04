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
  const { t, language } = useLanguage();
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
      technology: 'bg-purple-primary/20 text-purple-primary',
      cultural: 'bg-amber-500/20 text-amber-400',
      business: 'bg-blue-500/20 text-blue-400',
      entertainment: 'bg-pink-500/20 text-pink-400',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <LoadingSkeleton lines={2} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="bg-card">
                <div className="h-48 bg-muted rounded-t-lg animate-pulse" />
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
    <section id="events" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('events.title')}
          </h2>
          <p className="text-xl text-muted-foreground">{t('events.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={category.active ? 'default' : 'outline'}
              className={
                category.active
                  ? 'bg-purple-primary hover:bg-purple-primary/90'
                  : 'hover:bg-muted'
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
                className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={event.imageUrl || "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                    alt={language === 'ar' && event.titleAr ? event.titleAr : event.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                    <span className="text-purple-primary font-semibold">
                      {event.price === '0.00' || event.price === 0
                        ? t('events.free')
                        : `${event.currency} ${event.price}`}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {language === 'ar' && event.titleAr ? event.titleAr : event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
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
                      <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium">
                        +{Math.floor(Math.random() * 100)}
                      </div>
                    </div>
                    <Button
                      className="bg-purple-primary hover:bg-purple-primary/90"
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
              <p className="text-muted-foreground">No events available at the moment.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="border-2 border-purple-primary text-purple-primary hover:bg-purple-primary hover:text-white transition-all"
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
