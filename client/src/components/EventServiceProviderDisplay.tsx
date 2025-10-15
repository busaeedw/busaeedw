import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { Briefcase, Star, MapPin } from 'lucide-react';
import { type Event } from '@shared/schema';

interface EventServiceProviderDisplayProps {
  event: Event;
}

type ServiceProvider = {
  id: string;
  businessName: string;
  businessNameAr: string | null;
  category: string;
  city: string;
  services: string[];
  priceRange: string | null;
  rating: string;
  reviewCount: number;
  verified: boolean;
};

export function EventServiceProviderDisplay({ event }: EventServiceProviderDisplayProps) {
  const { t, language } = useLanguage();

  const serviceProviderIds = [
    event.serviceProvider1Id,
    event.serviceProvider2Id,
    event.serviceProvider3Id,
  ].filter(Boolean);

  const { data: serviceProviders = [], isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ['/api/events', event.id, 'service-providers'],
    enabled: serviceProviderIds.length > 0,
  });

  if (serviceProviderIds.length === 0 && !isLoading) {
    return null;
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      catering: { en: 'Catering', ar: 'تقديم الطعام' },
      photography: { en: 'Photography', ar: 'التصوير' },
      entertainment: { en: 'Entertainment', ar: 'الترفيه' },
      planning: { en: 'Event Planning', ar: 'تنظيم الفعاليات' },
    };
    return language === 'ar' ? labels[category]?.ar || category : labels[category]?.en || category;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('event.details.serviceProviders')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">{t('common.loading')}</div>
        ) : serviceProviders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t('event.details.noServiceProviders')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {serviceProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                data-testid={`service-provider-item-${provider.id}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-12 w-12 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {language === 'ar' && provider.businessNameAr ? provider.businessNameAr : provider.businessName}
                      </p>
                      {provider.verified && (
                        <Badge variant="secondary" className="text-xs">
                          {t('common.verified')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(provider.category)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{provider.city}</span>
                      </div>
                      {provider.rating && Number(provider.rating) > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                          <span>{Number(provider.rating).toFixed(1)} ({provider.reviewCount})</span>
                        </div>
                      )}
                    </div>
                    {provider.services && provider.services.length > 0 && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {provider.services.slice(0, 3).join(' • ')}
                      </p>
                    )}
                    {provider.priceRange && (
                      <p className="text-sm text-primary font-medium mt-1">
                        {provider.priceRange}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
