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
  price: z.string().min(1, 'Price is required'),
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
  const { t } = useLanguage();
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
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
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
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        price: parseFloat(data.price),
        maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        venueId: data.venueId || null, // Use venueId if selected, otherwise null
      };
      const response = await apiRequest('POST', '/api/events', eventData);
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
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
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
            {t('hero.cta.create')}
          </h1>
          <p className="text-gray-600">
            Fill in the details below to create your event
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
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
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event" 
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
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
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
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
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
                <CardTitle>Date & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
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
                        <FormLabel>End Date *</FormLabel>
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
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="Event location" {...field} />
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
                        <FormLabel>City *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="riyadh">Riyadh</SelectItem>
                            <SelectItem value="jeddah">Jeddah</SelectItem>
                            <SelectItem value="dammam">Dammam</SelectItem>
                            <SelectItem value="mecca">Mecca</SelectItem>
                            <SelectItem value="medina">Medina</SelectItem>
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
                            <FormLabel>Venue</FormLabel>
                            <Select disabled>
                              <FormControl>
                                <SelectTrigger data-testid="select-venue">
                                  <SelectValue placeholder="Loading venues..." />
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
                            <FormLabel>Venue</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Auto-fill venue and location when venue is selected
                                const selectedVenue = venues.find(v => v.id === value);
                                if (selectedVenue) {
                                  form.setValue("venue", selectedVenue.venue);
                                  form.setValue("location", selectedVenue.location);
                                }
                              }} 
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-venue">
                                  <SelectValue placeholder={`Select a venue in ${selectedCity}`} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="" key="custom">
                                  Custom Venue (enter below)
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
                          <FormLabel>Venue ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Will be auto-set when venue is selected" 
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
                      const isVenueSelected = Boolean(selectedVenueId && selectedVenueId !== "");

                      return (
                        <FormItem>
                          <FormLabel>Venue Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter venue name" 
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
                <CardTitle>Pricing & Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
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
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SAR">SAR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
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
                        <FormLabel>Max Attendees</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Unlimited" {...field} />
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
                      <FormLabel>Event Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
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
                    Creating...
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
