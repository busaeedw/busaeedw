import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Search, Filter, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

interface Organizer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  eventsCreated?: number;
}

export default function BrowseOrganizers() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Query for users with organizer role
  const { data: users = [], isLoading } = useQuery<Organizer[]>({
    queryKey: ['/api/users'],
  });

  // Filter for organizers and apply search
  const organizers = users
    .filter(user => user.role === 'organizer')
    .filter(organizer =>
      organizer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      organizer.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      organizer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title-organizers">
            {t('nav.browse.organizers')}
          </h1>
          <p className="text-gray-600">
            Connect with event organizers and explore their events
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search organizers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-organizers-input"
              />
            </div>
            <Button variant="outline" className="flex items-center" data-testid="filter-organizers-button">
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
          </div>
        </div>

        {/* Organizers Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="bg-white p-6 h-48 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded mb-2 w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : organizers.length === 0 ? (
          <Card className="bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizers.map((organizer, index) => (
              <Card key={organizer.id} className="bg-white p-6 hover:shadow-lg transition-shadow" data-testid={`organizer-card-${index}`}>
                <div className="flex items-center mb-4">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={`https://avatar.vercel.sh/${organizer.email}`} />
                    <AvatarFallback>
                      {organizer.firstName?.[0]}{organizer.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate" data-testid={`organizer-name-${index}`}>
                      {organizer.firstName} {organizer.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate" data-testid={`organizer-email-${index}`}>
                      {organizer.email}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Event Organizer</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{organizer.eventsCreated || 0} events created</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Active
                  </Badge>
                  <Button size="sm" className="bg-saudi-green hover:bg-saudi-green/90" data-testid={`organizer-contact-${index}`}>
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p>Total organizers: {organizers.length}</p>
        </div>
      </main>
    </div>
  );
}