import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/loading';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, MapPin, Users, Clock, Star, MessageSquare, Share2, Pencil, Trash2 } from 'lucide-react';
import { isUnauthorizedError } from '@/lib/authUtils';
import { EventSponsorManager } from '@/components/EventSponsorManager';
import { type Event, type VenueAggregate, type Organizer, type Review, type EventRegistration, type User } from '@shared/schema';
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

type EventWithOrganizer = Event & {
  organizer?: Organizer;
};

type RegistrationWithAttendee = EventRegistration & {
  attendee?: User;
};

type ReviewWithReviewer = Review & {
  reviewer?: User;
};

export default function EventDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const isAdmin = user?.role === 'admin';

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery<EventWithOrganizer>({
    queryKey: ['/api/events', id],
    enabled: !!id,
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery<RegistrationWithAttendee[]>({
    queryKey: ['/api/events', id, 'registrations'],
    enabled: !!id && isAuthenticated && (user?.role === 'organizer' || user?.role === 'admin'),
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<ReviewWithReviewer[]>({
    queryKey: ['/api/reviews/event', id],
    enabled: !!id,
  });

  // Load venue details if event has venueId
  const { data: venue, isLoading: venueLoading } = useQuery<VenueAggregate>({
    queryKey: [`/api/venues/${event?.venueId}`],
    enabled: !!event?.venueId,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/events/${id}/register`, { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/registrations'] });
      toast({
        title: "Success",
        description: "Successfully registered for the event!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('common.unauthorized'),
          description: t('common.unauthorized.desc'),
          variant: "destructive",
        });
        // Redirect to homepage instead of login to prevent auto-login loop
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/events/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: "Event deleted successfully",
      });
      setLocation('/browse/events');
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || "Failed to delete event",
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: 'bg-primary-100 text-primary-700',
      cultural: 'bg-gold-100 text-gold-700',
      business: 'bg-blue-100 text-blue-700',
      entertainment: 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const handleRegister = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for this event.",
      });
      // Redirect to traditional login page instead of OIDC to prevent auto-login loop
      window.location.href = "/login";
      return;
    }
    registerMutation.mutate();
  };

  if (eventLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner className="mx-auto" size="lg" />
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('event.details.notFound')}</h1>
            <p className="text-gray-600 mb-8">{t('event.details.notFoundDesc')}</p>
            <Button onClick={() => window.history.back()}>{t('event.details.goBack')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-96">
            <img
              src={event.imageUrl || "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Badge className={getCategoryColor(event.category)}>
                    {t(`events.filter.${event.category}`) || event.category}
                  </Badge>
                  <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setLocation(`/events/${id}/edit`)}
                      data-testid="edit-event-button"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDeleteClick}
                      data-testid="delete-event-button"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4" data-testid="event-detail-title">
                {language === 'ar' && event.titleAr ? event.titleAr : event.title}
              </h1>
              <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {event.city}, Saudi Arabia
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('event.details.about')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" data-testid="event-detail-description">
                  {language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description}
                </p>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('event.details.location')}</CardTitle>
              </CardHeader>
              <CardContent>
                {venueLoading ? (
                  <LoadingSkeleton lines={3} />
                ) : (
                  <div className="space-y-4">
                    {/* Display venue information from venues table if available */}
                    {venue ? (
                      <>
                        <div>
                          <h4 className="font-medium text-gray-900">{t('event.details.venue')}</h4>
                          <p className="text-gray-600">{language === 'ar' && venue.venue_ar ? venue.venue_ar : venue.venue}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{t('event.details.address')}</h4>
                          <p className="text-gray-600">{venue.location}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{t('event.details.city')}</h4>
                          <p className="text-gray-600">{venue.city}, Saudi Arabia</p>
                        </div>
                      </>
                    ) : (
                      /* Fallback to legacy venue fields for backward compatibility */
                      <>
                        <div>
                          <h4 className="font-medium text-gray-900">{t('event.details.address')}</h4>
                          <p className="text-gray-600">{event.location}</p>
                        </div>
                        {event.venue && (
                          <div>
                            <h4 className="font-medium text-gray-900">{t('event.details.venue')}</h4>
                            <p className="text-gray-600">{event.venue}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{t('event.details.city')}</h4>
                          <p className="text-gray-600">{event.city}, Saudi Arabia</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Sponsors */}
            <EventSponsorManager eventId={id!} isOrganizer={false} />

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>{t('event.details.reviews')}</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <LoadingSkeleton lines={3} />
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarImage src={review.reviewer?.profileImageUrl} />
                            <AvatarFallback>
                              {review.reviewer?.firstName?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">
                                {review.reviewer?.firstName || 'Anonymous'}
                              </span>
                              <div className="flex text-gold-400">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'fill-current' : ''
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t('event.details.noReviews')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-saudi-green mb-2">
                    {event.price === '0.00' || Number(event.price) === 0 ? (
                      'Free'
                    ) : (
                      `${event.currency} ${event.price}`
                    )}
                  </div>
                  <p className="text-gray-600">{t('event.details.perTicket')}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('event.details.date')}</span>
                    <span className="font-medium">
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('event.details.time')}</span>
                    <span className="font-medium">
                      {new Date(event.startDate).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  {event.maxAttendees && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t('event.details.capacity')}</span>
                      <span className="font-medium">{event.maxAttendees}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={registerMutation.isPending || event.status !== 'published'}
                  className="w-full bg-saudi-green hover:bg-saudi-green/90 mb-4"
                >
                  {registerMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Registering...
                    </>
                  ) : event.status !== 'published' ? (
                    'Event Not Available'
                  ) : (
                    t('events.cta.register')
                  )}
                </Button>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('event.details.contact')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    {t('event.details.share')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('event.details.organizer')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src={event.organizer?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {event.organizer?.firstName?.charAt(0) || 'O'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {event.organizer?.firstName || t('event.details.organizer')}
                    </h4>
                    <p className="text-sm text-gray-600">{event.organizer?.businessName || t('event.details.organizer')}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('event.details.messageOrganizer')}
                </Button>
              </CardContent>
            </Card>

            {/* Attendees (for organizers) */}
            {isAuthenticated && 
             (user?.id === event.organizerId || user?.role === 'admin') && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('event.details.attendees')} ({registrations?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {registrationsLoading ? (
                    <LoadingSkeleton lines={2} />
                  ) : registrations && registrations.length > 0 ? (
                    <div className="space-y-3">
                      {registrations.slice(0, 5).map((registration: any) => (
                        <div key={registration.id} className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={registration.attendee?.profileImageUrl} />
                            <AvatarFallback>
                              {registration.attendee?.firstName?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {registration.attendee?.firstName || 'Attendee'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {registration.ticketCode}
                            </p>
                          </div>
                        </div>
                      ))}
                      {registrations.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          And {registrations.length - 5} more...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">{t('event.details.noAttendees')}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event && (language === 'ar' && event.titleAr ? event.titleAr : event?.title)}"? This action cannot be undone.
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
