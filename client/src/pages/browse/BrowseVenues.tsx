import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Filter, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { type VenueAggregate } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BrowseVenues() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<VenueAggregate | null>(null);

  const isAdmin = user?.role === 'admin';
  
  const { data: venues = [], isLoading } = useQuery<VenueAggregate[]>({
    queryKey: ['/api/venues'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (venueId: string) => {
      await apiRequest(`/api/venues/${venueId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/venues'] });
      toast({
        title: t('common.success'),
        description: 'Venue deleted successfully',
      });
      setDeleteDialogOpen(false);
      setVenueToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to delete venue',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteClick = (venue: VenueAggregate) => {
    setVenueToDelete(venue);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (venueToDelete) {
      deleteMutation.mutate(venueToDelete.id);
    }
  };

  const filteredVenues = venues.filter(venue => {
    const venueName = language === 'ar' && venue.venue_ar ? venue.venue_ar : venue.venue;
    return venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
           venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (venue.venue_ar && venue.venue_ar.includes(searchQuery)) ||
           venue.venue.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
            {t('venues.browse.subtitle')}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('venues.notfound.title')}</h3>
            <p className="text-gray-600">{t('venues.notfound.subtitle')}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <Card key={venue.id} className="bg-white p-6 hover:shadow-lg transition-shadow" data-testid={`venue-card-${venue.id}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`venue-name-${venue.id}`}>
                    {language === 'ar' && venue.venue_ar ? venue.venue_ar : venue.venue || t('common.unknown.venue')}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span data-testid={`venue-location-${venue.id}`}>
                      {venue.location || t('common.unknown.location')}, {t(`venues.city.${venue.city?.toLowerCase()}`) || venue.city || t('common.unknown.city')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-saudi-green/10 text-saudi-green" data-testid={`venue-events-${venue.id}`}>
                      {venue.event_count} {t('venues.events.count')}
                    </Badge>
                    <Button size="sm" className="bg-saudi-green hover:bg-saudi-green/90" data-testid={`venue-view-${venue.id}`}>
                      {t('venues.button.view')}
                    </Button>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`edit-item-${venue.id}`}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteClick(venue)} data-testid={`delete-item-${venue.id}`}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p>{t('venues.total')} {filteredVenues.length}</p>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{venueToDelete && (language === 'ar' && venueToDelete.venue_ar ? venueToDelete.venue_ar : venueToDelete?.venue)}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}