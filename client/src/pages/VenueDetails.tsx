import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Building2, Star, User, Pencil, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Venue, VenueAggregate, Event, User as UserType } from "@shared/schema";

type VenueWithOwner = (Venue | VenueAggregate) & {
  owner?: UserType;
  name?: string;
  nameAr?: string | null;
  venue?: string;
  venue_ar?: string | null;
  event_count?: number;
};

export default function VenueDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const isAdmin = user?.role === 'admin';

  const { data: venue, isLoading: venueLoading, error: venueError } = useQuery<VenueWithOwner>({
    queryKey: [`/api/venues/${id}`],
    enabled: !!id,
  });

  const { data: venueEvents = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: [`/api/events?venueId=${id}`],
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/venues/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: "Venue deleted successfully",
      });
      setLocation('/browse/venues');
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || "Failed to delete venue",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  if (venueLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
            <div className="h-6 bg-gray-300 rounded mb-6 w-1/4"></div>
            <div className="h-48 bg-gray-300 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (venueError || !venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/venues">
            <Button variant="ghost" className="mb-6" data-testid="button-back-venues">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('venue.details.back')}
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('venue.details.notFound')}</h1>
            <p className="text-gray-600">{t('venue.details.notFoundDesc')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link href="/venues">
          <Button variant="ghost" className="mb-6" data-testid="button-back-venues">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('venue.details.back')}
          </Button>
        </Link>

        {/* Venue Information */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl text-saudi-green mb-2" data-testid="text-venue-name">
                  {language === 'ar' && venue.nameAr ? venue.nameAr : venue.name || venue.venue}
                </CardTitle>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span data-testid="text-venue-location">{venue.location}, {venue.city}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Badge variant="outline" className="text-saudi-green border-saudi-green">
                  <Building2 className="h-4 w-4 mr-1" />
                  {t('venue.details.badge')}
                </Badge>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setLocation(`/venues/${id}/edit`)}
                      data-testid="edit-venue-button"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDeleteClick}
                      data-testid="delete-venue-button"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-saudi-green/5 rounded-lg">
                <div className="text-2xl font-bold text-saudi-green mb-1" data-testid="text-venue-events-count">
                  {venue.event_count}
                </div>
                <div className="text-sm text-gray-600">{t('venue.details.eventsHosted')}</div>
              </div>
              <div className="text-center p-4 bg-saudi-green/5 rounded-lg">
                <div className="text-2xl font-bold text-saudi-green mb-1">
                  {venue.city}
                </div>
                <div className="text-sm text-gray-600">{t('venue.details.city')}</div>
              </div>
              <div className="text-center p-4 bg-saudi-green/5 rounded-lg">
                <div className="text-2xl font-bold text-saudi-green mb-1">
                  {venue.location}
                </div>
                <div className="text-sm text-gray-600">{t('venue.details.location')}</div>
              </div>
            </div>

            {/* Venue Coordinator Information */}
            {venue.owner && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t('venue.details.coordinator')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('venue.details.coordinatorName')}</p>
                    <p className="font-medium" data-testid="text-coordinator-name">
                      {venue.owner.firstName} {venue.owner.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('venue.details.coordinatorEmail')}</p>
                    <p className="font-medium" data-testid="text-coordinator-email">
                      {venue.owner.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('venue.details.coordinatorPhone')}</p>
                    <p className="font-medium" data-testid="text-coordinator-phone">
                      {venue.owner.phone || t('venue.details.notAvailable')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events at this Venue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              {t('venue.details.eventsAt')} {language === 'ar' && venue.nameAr ? venue.nameAr : venue.name || venue.venue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : venueEvents.length > 0 ? (
              <div className="space-y-4">
                {venueEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/events/${event.id}`}>
                          <h3 className="font-semibold text-lg hover:text-saudi-green transition-colors" data-testid={`link-event-${event.id}`}>
                            {event.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 mt-1" data-testid={`text-event-description-${event.id}`}>
                          {event.description?.slice(0, 150)}
                          {event.description && event.description.length > 150 ? '...' : ''}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span data-testid={`text-event-date-${event.id}`}>
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                          <Separator orientation="vertical" className="mx-2 h-4" />
                          <span data-testid={`text-event-price-${event.id}`}>
                            {event.price === '0.00' || Number(event.price) === 0 ? (
                              t('venue.details.free')
                            ) : (
                              `${event.currency} ${event.price}`
                            )}
                          </span>
                        </div>
                      </div>
                      <Badge variant={
                        event.status === 'published' ? 'default' : 
                        event.status === 'draft' ? 'secondary' : 'destructive'
                      }>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('venue.details.noEvents')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{venue && (language === 'ar' && venue.nameAr ? venue.nameAr : venue?.name || venue?.venue)}"? This action cannot be undone.
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