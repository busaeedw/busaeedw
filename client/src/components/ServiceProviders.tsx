import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Utensils, Camera, Music, Settings, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSkeleton } from '@/components/ui/loading';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export function ServiceProviders() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['/api/service-providers?limit=3&verified=true'],
  });

  const serviceCategories = [
    {
      icon: Utensils,
      title: t('services.catering'),
      description: t('services.catering.desc'),
      count: '120+',
      gradient: 'from-primary-50 to-primary-100',
      iconBg: 'bg-primary-600',
    },
    {
      icon: Camera,
      title: t('services.photography'),
      description: t('services.photography.desc'),
      count: '85+',
      gradient: 'from-gold-50 to-yellow-100',
      iconBg: 'bg-gold-500',
    },
    {
      icon: Music,
      title: t('services.entertainment'),
      description: t('services.entertainment.desc'),
      count: '60+',
      gradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-600',
    },
    {
      icon: Settings,
      title: t('services.planning'),
      description: t('services.planning.desc'),
      count: '45+',
      gradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <LoadingSkeleton lines={2} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i}>
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
    <section id="services" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-xl text-gray-600">{t('services.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {serviceCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={index}
                className={`text-center p-6 rounded-2xl bg-gradient-to-br ${category.gradient} hover:shadow-lg transition-all cursor-pointer`}
              >
                <div className={`${category.iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="text-white h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <Badge variant="secondary" className="text-primary-600">
                  {category.count} {t('services.providers')}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Featured Service Providers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers && providers.length > 0 ? (
            providers.map((provider: any) => (
              <Card
                key={provider.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={provider.user?.profileImageUrl || "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&w=100&h=100&fit=face"}
                        alt={provider.businessName}
                      />
                      <AvatarFallback>
                        {provider.businessName?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.businessName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 capitalize">
                        {provider.category}
                      </p>
                      <div className="flex items-center mb-3">
                        <div className="flex text-gold-400">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(provider.rating || 0)
                                  ? 'fill-current'
                                  : ''
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          {provider.rating || 0} ({provider.reviewCount || 0} {t('services.reviews')})
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {provider.services?.join(', ') || 'Professional services'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-saudi-green">
                          {t('services.from')} {provider.priceRange || 'Contact for pricing'}
                        </span>
                        <Button
                          size="sm"
                          className="bg-saudi-green hover:bg-saudi-green/90"
                          onClick={() => {
                            if (isAuthenticated) {
                              window.location.href = `/service-providers/${provider.id}`;
                            } else {
                              window.location.href = '/api/login';
                            }
                          }}
                        >
                          {t('services.cta.profile')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No service providers available at the moment.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            className="bg-saudi-green hover:bg-saudi-green/90"
            onClick={() => {
              if (isAuthenticated) {
                window.location.href = '/service-providers';
              } else {
                window.location.href = '/api/login';
              }
            }}
          >
            {t('services.cta.browse')}
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
