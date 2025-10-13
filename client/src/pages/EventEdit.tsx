
import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { type Event } from '@shared/schema';
import { EventSponsorManager } from '@/components/EventSponsorManager';

type EventFormData = {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  venue?: string;
  venueId?: string;
  price: string;
  currency: string;
  maxAttendees?: number;
  imageUrl?: string;
  status: 'draft' | 'published';
};

export default function EventEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ['/api/events', id],
    enabled: !!id,
  });

  const { data: venues } = useQuery({
    queryKey: ['/api/venues'],
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      currency: 'SAR',
      status: 'draft',
    },
  });

  useEffect(() => {
    if (event) {
      setValue('title', event.title);
      setValue('titleAr', event.titleAr || '');
      setValue('description', event.description);
      setValue('descriptionAr', event.descriptionAr || '');
      setValue('category', event.category);
      setValue('startDate', new Date(event.startDate).toISOString().slice(0, 16));
      setValue('endDate', new Date(event.endDate).toISOString().slice(0, 16));
      setValue('location', event.location);
      setValue('city', event.city);
      setValue('venue', event.venue || '');
      setValue('venueId', event.venueId || '');
      setValue('price', event.price);
      setValue('currency', event.currency);
      setValue('maxAttendees', event.maxAttendees || undefined);
      setValue('imageUrl', event.imageUrl || '');
      setValue('status', event.status);
    }
  }, [event, setValue]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', id] });
      toast({
        title: t('common.success'),
        description: "Event updated successfully",
      });
      setLocation(`/events/${id}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('common.unauthorized'),
          description: t('common.unauthorized.desc'),
          variant: "destructive",
        });
        return;
      }
      toast({
        title: t('common.error'),
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  useEffect(() => {
    if (!authLoading && !eventLoading && event && user) {
      if (event.organizerId !== user.id && user.role !== 'admin') {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to edit this event",
          variant: "destructive",
        });
        setLocation(`/events/${id}`);
      }
    }
  }, [event, user, authLoading, eventLoading, id, setLocation, toast]);

  const onSubmit = (data: EventFormData) => {
    updateEventMutation.mutate(data);
  };

  if (authLoading || eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner className="mx-auto" size="lg" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <Button onClick={() => setLocation('/browse/events')}>Back to Events</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Event</h1>
          <p className="text-gray-600">Update your event details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('event.create.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('event.create.title')} (English) *</Label>
                  <Input id="title" {...register('title', { required: true })} />
                  {errors.title && <span className="text-sm text-red-500">This field is required</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleAr">{t('event.create.title')} (Arabic)</Label>
                  <Input id="titleAr" {...register('titleAr')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('event.create.description')} (English) *</Label>
                <Textarea id="description" {...register('description', { required: true })} rows={5} />
                {errors.description && <span className="text-sm text-red-500">This field is required</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionAr">{t('event.create.description')} (Arabic)</Label>
                <Textarea id="descriptionAr" {...register('descriptionAr')} rows={5} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('event.create.category')} *</Label>
                <Select onValueChange={(value) => setValue('category', value)} value={watch('category')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">{t('events.filter.technology')}</SelectItem>
                    <SelectItem value="cultural">{t('events.filter.cultural')}</SelectItem>
                    <SelectItem value="business">{t('events.filter.business')}</SelectItem>
                    <SelectItem value="entertainment">{t('events.filter.entertainment')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">{t('event.create.imageUrl')}</Label>
                <Input id="imageUrl" {...register('imageUrl')} placeholder="https://example.com/image.jpg" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('event.create.dateTime')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t('event.create.startDate')} *</Label>
                  <Input id="startDate" type="datetime-local" {...register('startDate', { required: true })} />
                  {errors.startDate && <span className="text-sm text-red-500">This field is required</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">{t('event.create.endDate')} *</Label>
                  <Input id="endDate" type="datetime-local" {...register('endDate', { required: true })} />
                  {errors.endDate && <span className="text-sm text-red-500">This field is required</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('event.create.location')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venueId">{t('event.create.venue')}</Label>
                <Select onValueChange={(value) => setValue('venueId', value)} value={watch('venueId')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues?.map((venue: any) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.venue} - {venue.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('event.create.address')} *</Label>
                <Input id="location" {...register('location', { required: true })} />
                {errors.location && <span className="text-sm text-red-500">This field is required</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t('event.create.city')} *</Label>
                <Select onValueChange={(value) => setValue('city', value)} value={watch('city')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Riyadh">Riyadh</SelectItem>
                    <SelectItem value="Jeddah">Jeddah</SelectItem>
                    <SelectItem value="Dammam">Dammam</SelectItem>
                    <SelectItem value="Mecca">Mecca</SelectItem>
                    <SelectItem value="Medina">Medina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('event.create.ticketing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('event.create.price')} *</Label>
                  <Input id="price" type="number" step="0.01" {...register('price', { required: true })} />
                  {errors.price && <span className="text-sm text-red-500">This field is required</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">{t('event.create.currency')}</Label>
                  <Select onValueChange={(value) => setValue('currency', value)} value={watch('currency')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">{t('event.create.maxAttendees')}</Label>
                <Input id="maxAttendees" type="number" {...register('maxAttendees', { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select onValueChange={(value: 'draft' | 'published') => setValue('status', value)} value={watch('status')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setLocation(`/events/${id}`)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={updateEventMutation.isPending}>
              {updateEventMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.saveChanges')
              )}
            </Button>
          </div>
        </form>

        {/* Sponsor Management Section */}
        <div className="mt-8">
          <EventSponsorManager eventId={id!} isOrganizer={true} />
        </div>
      </main>
    </div>
  );
}
