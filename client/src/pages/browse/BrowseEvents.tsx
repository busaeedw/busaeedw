import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/ui/loading';
import { Calendar, Search, Filter, MapPin, Users, Clock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { type Event } from '@shared/schema';


export default function BrowseEvents() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  // Build query parameters for events API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
    params.append('limit', '20');
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: [`/api/events${buildQueryString()}`],
  });

  const categories = [
    { value: 'all', label: t('events.filter.all') },
    { value: 'business', label: t('events.filter.business') },
    { value: 'cultural', label: t('events.filter.cultural') },
    { value: 'technology', label: t('events.filter.technology') },
    { value: 'entertainment', label: t('events.filter.entertainment') },
  ];

  const cities = [
    { value: 'all', label: t('venues.city.all') },
    { value: 'riyadh', label: t('venues.city.riyadh') },
    { value: 'jeddah', label: t('venues.city.jeddah') },
    { value: 'dammam', label: t('venues.city.dammam') },
    { value: 'mecca', label: t('venues.city.mecca') },
    { value: 'medina', label: t('venues.city.medina') },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: 'bg-primary-100 text-primary-700',
      cultural: 'bg-gold-100 text-gold-700',
      business: 'bg-blue-100 text-blue-700',
      entertainment: 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateStr: string | Date) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return t('events.date.tbd');
      }
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return t('events.date.tbd');
    }
  };

  const formatTime = (dateStr: string | Date) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return t('events.time.tbd');
      }
      return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return t('events.time.tbd');
    }
  };

  // Filter events locally based on search query, category, and city
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      (language === 'ar' && event.titleAr ? event.titleAr : event.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || event.city.toLowerCase() === selectedCity.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title-events">
            {language === 'ar' ? 'الفعاليات' : 'Events'}
          </h1>
          <p className="text-gray-600">
            {t('events.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-events-input"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="category-filter-select">
                <SelectValue placeholder={t('common.category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger data-testid="city-filter-select">
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

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <LoadingSkeleton className="h-4 w-3/4 mb-4" />
                <LoadingSkeleton className="h-3 w-full mb-2" />
                <LoadingSkeleton className="h-3 w-2/3 mb-4" />
                <LoadingSkeleton className="h-8 w-20 mb-4" />
                <LoadingSkeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? t('events.notfound.title') : t('events.notfound.title')}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? t('events.notfound.subtitle')
                : t('events.notfound.subtitle')}
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600" data-testid="events-count">
                {t('common.showing')} {filteredEvents.length} {filteredEvents.length === 1 ? t('events.singular') : t('events.plural')}
                {searchQuery && ` ${t('common.matching')} "${searchQuery}"`}
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`event-card-${event.id}`}>
                  <div className="p-6">
                    {/* Event Category Badge */}
                    <div className="mb-3">
                      <Badge className={`${getCategoryColor(event.category)} text-xs`}>
                        {t(`events.filter.${event.category}`) || event.category}
                      </Badge>
                    </div>

                    {/* Event Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1" data-testid={`event-title-${event.id}`}>
                      {language === 'ar' && event.titleAr ? event.titleAr : event.title}
                    </h3>

                    {/* Event Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm" data-testid={`event-description-${event.id}`}>
                      {language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span data-testid={`event-date-${event.id}`}>
                          {formatDate(event.startDate)} {t('common.at')} {formatTime(event.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1" data-testid={`event-venue-${event.id}`}>
                          {event.venue ? `${event.venue}, ${event.city}` : `${event.location}, ${event.city}`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span data-testid={`event-capacity-${event.id}`}>
                          {event.maxAttendees ? `${t('events.capacity.upto')} ${event.maxAttendees} ${t('events.capacity.attendees')}` : t('events.capacity.unlimited')}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full" 
                      variant="outline"
                      data-testid={`view-event-${event.id}`}
                      asChild
                    >
                      <Link href={`/events/${event.id}`}>
                        {t('events.cta.view')}
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More Button (if needed) */}
            {filteredEvents.length >= 20 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg" data-testid="load-more-events">
                  {t('events.cta.loadmore')}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}