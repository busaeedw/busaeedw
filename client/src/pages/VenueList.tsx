import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/ui/loading';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Search, Filter, MapPin, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { type VenueAggregate, venueAggregateSchema } from '@shared/schema';
import { z } from 'zod';

export default function VenueList() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Build query parameters for venues API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
    params.append('limit', '20');
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const { data: venues, isLoading, error } = useQuery({
    queryKey: [`/api/venues${buildQueryString()}`],
  });

  // Safely validate and type the venues data
  const validateVenues = (data: unknown): VenueAggregate[] => {
    if (!data || !Array.isArray(data)) {
      console.warn('Venues API returned invalid data format:', data);
      return [];
    }
    
    return data.filter((item): item is VenueAggregate => {
      try {
        venueAggregateSchema.parse(item);
        return true;
      } catch (e) {
        console.warn('Invalid venue data item:', item, e);
        return false;
      }
    });
  };

  const venuesList = validateVenues(venues);

  const cities = [
    { value: 'all', label: t('venues.city.all') },
    { value: 'riyadh', label: t('venues.city.riyadh') },
    { value: 'jeddah', label: t('venues.city.jeddah') },
    { value: 'dammam', label: t('venues.city.dammam') },
    { value: 'mecca', label: t('venues.city.mecca') },
    { value: 'medina', label: t('venues.city.medina') },
  ];

  // Mock venues data for now until API is working
  const mockVenues = [
    {
      venue: "Four Seasons Hotel Riyadh - Kingdom Ballroom",
      city: "riyadh",
      location: "Diplomatic Quarter",
      event_count: 3
    },
    {
      venue: "Raffles Hotel Riyadh - Rafal Ballroom",
      city: "riyadh", 
      location: "King Fahd Road",
      event_count: 2
    },
    {
      venue: "Al Faisaliah Hotel - Prince Sultan's Grand Hall",
      city: "riyadh",
      location: "Diplomatic Quarter", 
      event_count: 2
    },
    {
      venue: "Hilton Riyadh Hotel & Residences",
      city: "riyadh",
      location: "King Abdullah Financial District",
      event_count: 2
    },
    {
      venue: "JW Marriott Hotel Riyadh",
      city: "riyadh",
      location: "Historic Diriyah",
      event_count: 1
    },
    {
      venue: "Riyadh International Convention & Exhibition Center",
      city: "riyadh",
      location: "Riyadh Front",
      event_count: 2
    },
    {
      venue: "Mövenpick Hotel Riyadh - Grand Ballroom",
      city: "riyadh",
      location: "King Abdullah Financial District",
      event_count: 1
    },
    {
      venue: "King Fahd Culture Centre",
      city: "riyadh",
      location: "King Abdullah Park", 
      event_count: 2
    },
    {
      venue: "Nayyara Banqueting & Conference Centre",
      city: "riyadh",
      location: "King Saud University District",
      event_count: 1
    },
    {
      venue: "Radisson Blu Hotel & Convention Center",
      city: "riyadh",
      location: "King Abdullah Financial District",
      event_count: 1
    }
  ];

  // Use mock data if API is not working or returns no results
  const hasApiData = venuesList.length > 0;
  const displayVenues = hasApiData ? venuesList : mockVenues;
  
  // Show API error if there's an error but we're using mock data
  const showApiError = error && !hasApiData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('venues.title')}
          </h1>
          <p className="text-gray-600">{t('venues.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('venues.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-venue-search"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger data-testid="select-city-filter">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center" data-testid="button-filter">
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
          </div>
        </div>

        {/* API Error Warning */}
        {showApiError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 font-medium">{t('venues.error.banner.title')}</p>
              <p className="text-yellow-700 text-sm">{t('venues.error.banner.subtitle')}</p>
            </div>
          </div>
        )}

        {/* Venues Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="bg-white">
                <div className="h-48 bg-gray-200 rounded-t-lg animate-pulse" />
                <CardContent className="p-6">
                  <LoadingSkeleton lines={4} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayVenues && displayVenues.length > 0 ? (
              displayVenues.map((venue: VenueAggregate, index: number) => (
                <Card
                  key={`${venue.venue}-${index}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                  data-testid={`card-venue-${index}`}
                >
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop"
                      alt={venue.venue || 'Venue image'}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-saudi-green text-white">
                        {venue.event_count || 0} {t('venues.events.count')}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {venue.venue || 'Unknown Venue'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{venue.location || 'Unknown Location'}, {venue.city || 'Unknown City'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{venue.event_count || 0} {t('venues.events.upcoming')}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-saudi-green hover:bg-saudi-green/90"
                        data-testid={`button-view-venue-${index}`}
                      >
                        {t('venues.button.view')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('venues.notfound.title')}</h3>
                <p className="text-gray-500 mb-6">
                  {t('venues.notfound.subtitle')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Load More */}
        {displayVenues && displayVenues.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" data-testid="button-load-more">
              {t('venues.button.loadmore')}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}