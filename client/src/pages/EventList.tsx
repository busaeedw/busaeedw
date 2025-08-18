import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/ui/loading';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'wouter';
import { Calendar, MapPin, Search, Filter } from 'lucide-react';

export default function EventList() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events', { 
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      city: selectedCity || undefined,
      limit: 20 
    }],
  });

  const categories = [
    { value: '', label: t('events.filter.all') },
    { value: 'business', label: t('events.filter.business') },
    { value: 'cultural', label: t('events.filter.cultural') },
    { value: 'technology', label: t('events.filter.technology') },
    { value: 'entertainment', label: t('events.filter.entertainment') },
  ];

  const cities = [
    { value: '', label: 'All Cities' },
    { value: 'riyadh', label: 'Riyadh' },
    { value: 'jeddah', label: 'Jeddah' },
    { value: 'dammam', label: 'Dammam' },
    { value: 'mecca', label: 'Mecca' },
    { value: 'medina', label: 'Medina' },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('events.title')}
          </h1>
          <p className="text-gray-600">{t('events.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder={t('common.location')} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
          </div>
        </div>

        {/* Events Grid */}
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
                        asChild
                        className="bg-saudi-green hover:bg-saudi-green/90"
                      >
                        <Link href={`/events/${event.id}`}>
                          {t('events.cta.view')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search criteria or browse all events.
                </p>
                <Button asChild>
                  <Link href="/events/create">Create Event</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Load More */}
        {events && events.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline">
              Load More Events
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
