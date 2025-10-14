import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/ui/loading';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { Search, Plus, Building2, Globe, MapPin, Star } from 'lucide-react';
import { type Sponsor } from '@shared/schema';

export default function Sponsors() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
    params.append('limit', '20');
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const queryString = buildQueryString();
  const { data: sponsors, isLoading } = useQuery<Sponsor[]>({
    queryKey: [`/api/sponsors${queryString}`],
  });

  const cities = [
    { value: 'all', label: t('common.all') },
    { value: 'Riyadh', label: t('common.cities.riyadh') },
    { value: 'Jeddah', label: t('common.cities.jeddah') },
    { value: 'Dammam', label: t('common.cities.dammam') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('sponsors.title')}
            </h1>
            <p className="text-muted-foreground">{t('sponsors.subtitle')}</p>
          </div>
          {user && (user.role === 'admin' || user.role === 'sponsor') && (
            <Link href="/sponsors/create">
              <Button data-testid="button-create-sponsor">
                <Plus className="h-4 w-4 mr-2" />
                {t('sponsors.create')}
              </Button>
            </Link>
          )}
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('sponsors.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-sponsor-search"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger data-testid="select-city-filter">
                <SelectValue placeholder={t('common.select.city')} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="h-48">
                <CardContent className="p-6">
                  <LoadingSkeleton />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sponsors && sponsors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.map((sponsor) => (
              <Link key={sponsor.id} href={`/sponsors/${sponsor.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-sponsor-${sponsor.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      {sponsor.logoUrl ? (
                        <img
                          src={sponsor.logoUrl}
                          alt={language === 'ar' && sponsor.nameAr ? sponsor.nameAr : sponsor.name}
                          className="h-16 w-16 object-contain rounded"
                          data-testid={`img-sponsor-logo-${sponsor.id}`}
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {language === 'ar' && sponsor.nameAr ? sponsor.nameAr : sponsor.name}
                        </CardTitle>
                        {sponsor.isFeatured && (
                          <Badge variant="secondary" className="mt-2">
                            <Star className="h-3 w-3 mr-1" />
                            {t('sponsors.featured')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sponsor.city && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {sponsor.city}
                      </div>
                    )}
                    {sponsor.website && (
                      <div className="flex items-center text-sm text-primary truncate">
                        <Globe className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{sponsor.website}</span>
                      </div>
                    )}
                    {sponsor.description && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {language === 'ar' && sponsor.descriptionAr ? sponsor.descriptionAr : sponsor.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">{t('sponsors.empty.title')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('sponsors.empty.subtitle')}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
