import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { type VenueAggregate } from '@shared/schema';

export default function BrowseVenues() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: venues = [], isLoading } = useQuery<VenueAggregate[]>({
    queryKey: ['/api/venues'],
  });

  const filteredVenues = venues.filter(venue =>
    venue.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title-venues">
            {t('nav.browse.venues')}
          </h1>
          <p className="text-gray-600">
            Discover and explore available venues for your events
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('venues.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-venues-input"
              />
            </div>
            <Button variant="outline" className="flex items-center" data-testid="filter-venues-button">
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
          </div>
        </div>

        {/* Venues Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="bg-white p-6 h-48 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : filteredVenues.length === 0 ? (
          <Card className="bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <Card key={venue.id} className="bg-white p-6 hover:shadow-lg transition-shadow" data-testid={`venue-card-${venue.id}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`venue-name-${venue.id}`}>
                    {venue.venue || t('common.unknown.venue')}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span data-testid={`venue-location-${venue.id}`}>
                      {venue.location || t('common.unknown.location')}, {t(`venues.city.${venue.city?.toLowerCase()}`) || venue.city || t('common.unknown.city')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-saudi-green/10 text-saudi-green" data-testid={`venue-events-${venue.id}`}>
                      {venue.event_count} events
                    </Badge>
                    <Button size="sm" className="bg-saudi-green hover:bg-saudi-green/90" data-testid={`venue-view-${venue.id}`}>
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p>Total venues: {filteredVenues.length}</p>
        </div>
      </main>
    </div>
  );
}