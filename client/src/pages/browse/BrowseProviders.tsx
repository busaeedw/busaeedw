import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, Filter, MapPin, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface ServiceProvider {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  description: string;
  location: string;
  priceRange: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  services: string[];
  contactInfo: {
    email: string;
    phone: string;
  };
}

export default function BrowseProviders() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: providers = [], isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ['/api/service-providers'],
  });

  const categories = [
    { value: 'all', label: t('providers.category.all') },
    { value: 'catering', label: t('providers.category.catering') },
    { value: 'photography', label: t('providers.category.photography') },
    { value: 'entertainment', label: t('providers.category.entertainment') },
    { value: 'decoration', label: t('providers.category.decoration') },
    { value: 'audio_visual', label: t('providers.category.audio_visual') },
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title-providers">
            {t('nav.browse.providers')}
          </h1>
          <p className="text-gray-600">
            {t('providers.browse.subtitle')}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('providers.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-providers-input"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-provider-category">
                <SelectValue placeholder={t('providers.category.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center" data-testid="filter-providers-button">
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
          </div>
        </div>

        {/* Providers Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="bg-white p-6 h-64 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <Card className="bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('providers.notfound.title')}</h3>
            <p className="text-gray-600">{t('providers.notfound.subtitle')}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider, index) => (
              <Card key={provider.id} className="bg-white p-6 hover:shadow-lg transition-shadow" data-testid={`provider-card-${index}`}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900" data-testid={`provider-name-${index}`}>
                      {provider.businessName}
                    </h3>
                    {provider.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">
                      {typeof provider.rating === 'number' ? provider.rating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">({provider.totalReviews || 0} reviews)</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span data-testid={`provider-location-${index}`}>{provider.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span data-testid={`provider-price-${index}`}>{provider.priceRange}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <Badge variant="outline" className="text-xs">
                    {provider.category}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3" data-testid={`provider-description-${index}`}>
                  {provider.description}
                </p>

                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" data-testid={`provider-details-${index}`}>
                    View Details
                  </Button>
                  <Button size="sm" className="bg-saudi-green hover:bg-saudi-green/90" data-testid={`provider-contact-${index}`}>
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p>Total service providers: {filteredProviders.length}</p>
        </div>
      </main>
    </div>
  );
}