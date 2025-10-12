import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading';
import { apiRequest } from '@/lib/queryClient';
import { insertEventSchema } from '@shared/schema';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { isUnauthorizedError } from '@/lib/authUtils';

const eventFormSchema = insertEventSchema.extend({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Price must be a valid number (0 or greater)'),
  maxAttendees: z.string().optional(),
}).omit({
  organizerId: true,
}).refine(
  (data) => data.venueId || (data.venue && data.location),
  {
    message: "Either select a venue from the database or provide venue name and location",
    path: ["venue"],
  }
);

type EventFormData = z.infer<typeof eventFormSchema>;

type Venue = {
  id: string;
  venue: string;
  city: string;
  location: string;
  event_count: number;
};

export default function EventCreate() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Load venues from API
  const { data: venues = [], isLoading: venuesLoading } = useQuery<Venue[]>({
    queryKey: ['/api/venues'],
    enabled: isAuthenticated, // Only load venues when authenticated
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    const isLoggingOut = localStorage.getItem('isLoggingOut') === 'true';
    
    // Clear the logout flag if it exists
    if (isLoggingOut) {
      localStorage.removeItem('isLoggingOut');
    }
    
    if (!isLoading && !isAuthenticated && !isLoggingOut) {
      toast({
        title: t('common.unauthorized'),
        description: t('common.unauthorized.desc'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user can create events
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if ((user as any).role !== 'organizer' && (user as any).role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Only organizers can create events.",
          variant: "destructive",
        });
        setLocation('/dashboard');
      }
    }
  }, [user, isAuthenticated, isLoading, toast, setLocation]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      startDate: '',
      endDate: '',
      location: '',
      city: '',
      venue: '',
      venueId: '',
      price: '0',
      currency: 'SAR',
      maxAttendees: undefined,
      imageUrl: '',
      status: 'draft',
      tags: [],
    },
  });

  // Reset venue selection when city changes
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'city') {
        form.setValue('venueId', '');
        form.setValue('venue', '');
        form.setValue('location', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData = {
        ...data,
        startDate: new Date(data.startDate), // Send Date object, not ISO string
        endDate: new Date(data.endDate),     // Send Date object, not ISO string
        price: data.price.toString(),        // Send string, not number (for decimal precision)
        maxAttendees: data.maxAttendees && data.maxAttendees.trim() !== '' ? parseInt(data.maxAttendees) : null,
        venueId: data.venueId && data.venueId !== 'custom' ? data.venueId : null, // Set to null for custom venues
      };
      const response = await apiRequest('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/events'] });
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      setLocation(`/events/${event.id}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('common.unauthorized'),
          description: t('common.unauthorized.desc'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error('Event creation error:', error);
      // Try to parse validation errors if available
      let errorMessage = error.message || "Failed to create event";
      try {
        // If error has validation details, show them
        const errorData = JSON.parse(error.message);
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((err: any) => `${err.path?.join('.') || 'Field'}: ${err.message}`).join(', ');
        }
      } catch {
        // Use original error message if parsing fails
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner className="mx-auto" size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('event.create.title')}
          </h1>
          <p className="text-gray-600">
            {t('event.create.subtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('event.create.basic.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('event.create.basic.event.title')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('event.create.basic.event.title.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('event.create.basic.description')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('event.create.basic.description.placeholder')} 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('event.create.basic.category')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('event.create.basic.category.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="business">{t('event.create.basic.category.business')}</SelectItem>
                            <SelectItem value="cultural">{t('event.create.basic.category.cultural')}</SelectItem>
                            <SelectItem value="technology">{t('event.create.basic.category.technology')}</SelectItem>
                            <SelectItem value="entertainment">{t('event.create.basic.category.entertainment')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('event.create.basic.status')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('event.create.basic.status.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">{t('event.create.basic.status.draft')}</SelectItem>
                            <SelectItem value="published">{t('event.create.basic.status.published')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('event.create.datetime.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('event.create.datetime.start')}</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('event.create.datetime.end')}</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('event.create.datetime.location')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('event.create.datetime.location.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('event.create.datetime.city')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('event.create.datetime.city.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="riyadh">{t('event.create.datetime.city.riyadh')}</SelectItem>
                            <SelectItem value="jeddah">{t('event.create.datetime.city.jeddah')}</SelectItem>
                            <SelectItem value="dammam">{t('event.create.datetime.city.dammam')}</SelectItem>
                            <SelectItem value="mecca">{t('event.create.datetime.city.mecca')}</SelectItem>
                            <SelectItem value="medina">{t('event.create.datetime.city.medina')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venueId"
                    render={({ field }) => {
                      const selectedCity = form.watch("city");
                      const cityVenues = venues.filter(v => 
                        v.city.toLowerCase() === selectedCity?.toLowerCase()
                      );

                      // If loading venues, show loading state
                      if (venuesLoading) {
                        return (
                          <FormItem>
                            <FormLabel>{t('event.create.datetime.venue')}</FormLabel>
                            <Select disabled>
                              <FormControl>
                                <SelectTrigger data-testid="select-venue">
                                  <SelectValue placeholder={t('event.create.datetime.venue.loading')} />
                                </SelectTrigger>
                              </FormControl>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }

                      // If city has venues in database, show dropdown
                      if (selectedCity && cityVenues.length > 0) {
                        return (
                          <FormItem>
                            <FormLabel>{t('event.create.datetime.venue')}</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Auto-fill venue and location when venue is selected
                                if (value === "custom") {
                                  // Clear auto-filled values for custom venue
                                  form.setValue("venue", "");
                                  form.setValue("location", "");
                                } else {
                                  const selectedVenue = venues.find(v => v.id === value);
                                  if (selectedVenue) {
                                    const venueName = selectedVenue.venue;
                                    form.setValue("venue", venueName);
                                    form.setValue("location", selectedVenue.location);
                                  }
                                }
                              }} 
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-venue">
                                  <SelectValue placeholder={`${t('event.create.datetime.venue.select').replace('{{city}}', selectedCity || '')}`} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="custom" key="custom">
                                  {t('event.create.datetime.venue.custom')}
                                </SelectItem>
                                {cityVenues.map((venue) => (
                                  <SelectItem key={venue.id} value={venue.id}>
                                    {venue.venue}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }

                      // For custom venues or cities without venues in database
                      return (
                        <FormItem>
                          <FormLabel>{t('event.create.datetime.venue.id')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('event.create.datetime.venue.id.placeholder')} 
                              {...field} 
                              value={field.value || ''} 
                              disabled
                              data-testid="input-venue-id"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => {
                      const selectedVenueId = form.watch("venueId");
                      const isVenueSelected = Boolean(selectedVenueId && selectedVenueId !== "" && selectedVenueId !== "custom");

                      return (
                        <FormItem>
                          <FormLabel>{t('event.create.datetime.venue.name')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('event.create.datetime.venue.name.placeholder')} 
                              {...field} 
                              value={field.value || ''} 
                              disabled={isVenueSelected}
                              data-testid="input-venue-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('event.create.pricing.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('event.create.pricing.price')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t('event.create.pricing.price.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('event.create.pricing.currency')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('event.create.pricing.currency.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SAR">{t('event.create.pricing.currency.sar')}</SelectItem>
                            <SelectItem value="USD">{t('event.create.pricing.currency.usd')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxAttendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('event.create.pricing.maxattendees')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t('event.create.pricing.maxattendees.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('event.create.pricing.image')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('event.create.pricing.image.placeholder')} {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setLocation('/dashboard')}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={createEventMutation.isPending}
                className="bg-saudi-green hover:bg-saudi-green/90"
              >
                {createEventMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t('event.create.button.create')}
                  </>
                ) : (
                  t('common.create')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
