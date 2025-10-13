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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading';
import { apiRequest } from '@/lib/queryClient';
import { type Sponsor } from '@shared/schema';
import { z } from 'zod';
import { useLocation, useParams } from 'wouter';

const sponsorFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().optional(),
  logoUrl: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  city: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

type SponsorFormData = z.infer<typeof sponsorFormSchema>;

export default function SponsorForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch sponsor data if editing
  const { data: sponsor, isLoading: sponsorLoading } = useQuery<Sponsor>({
    queryKey: ['/api/sponsors', id],
    enabled: isEditMode && isAuthenticated,
  });

  // Check if user can create/edit sponsors
  useEffect(() => {
    const isLoggingOut = localStorage.getItem('isLoggingOut') === 'true';
    
    if (isLoggingOut) {
      localStorage.removeItem('isLoggingOut');
    }
    
    if (!authLoading && !isAuthenticated && !isLoggingOut) {
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

    if (!authLoading && isAuthenticated && user) {
      if ((user as any).role !== 'sponsor' && (user as any).role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Only sponsors and admins can manage sponsors.",
          variant: "destructive",
        });
        setLocation('/dashboard');
      }
    }
  }, [user, isAuthenticated, authLoading, toast, setLocation]);

  const form = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      logoUrl: '',
      website: '',
      description: '',
      descriptionAr: '',
      contactEmail: '',
      contactPhone: '',
      city: '',
      isFeatured: false,
    },
  });

  // Populate form with sponsor data when editing
  useEffect(() => {
    if (isEditMode && sponsor) {
      form.reset({
        name: sponsor.name || '',
        nameAr: sponsor.nameAr || '',
        logoUrl: sponsor.logoUrl || '',
        website: sponsor.website || '',
        description: sponsor.description || '',
        descriptionAr: sponsor.descriptionAr || '',
        contactEmail: sponsor.contactEmail || '',
        contactPhone: sponsor.contactPhone || '',
        city: sponsor.city || '',
        isFeatured: sponsor.isFeatured || false,
      });
    }
  }, [sponsor, isEditMode, form]);

  const createSponsorMutation = useMutation({
    mutationFn: async (data: SponsorFormData) => {
      return await apiRequest('/api/sponsors', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t('sponsors.create.success'),
        description: t('sponsors.create.success.desc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sponsors'] });
      setLocation('/sponsors');
    },
    onError: () => {
      toast({
        title: t('sponsors.create.error'),
        description: t('sponsors.create.error.desc'),
        variant: 'destructive',
      });
    },
  });

  const updateSponsorMutation = useMutation({
    mutationFn: async (data: SponsorFormData) => {
      return await apiRequest(`/api/sponsors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t('sponsors.update.success'),
        description: t('sponsors.update.success.desc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sponsors', id] });
      setLocation('/sponsors');
    },
    onError: () => {
      toast({
        title: t('sponsors.update.error'),
        description: t('sponsors.update.error.desc'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: SponsorFormData) => {
    if (isEditMode) {
      updateSponsorMutation.mutate(data);
    } else {
      createSponsorMutation.mutate(data);
    }
  };

  if (authLoading || (isEditMode && sponsorLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEditMode ? t('sponsors.edit.title') : t('sponsors.create.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sponsors.form.name')}</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-sponsor-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sponsors.form.nameAr')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-sponsor-nameAr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sponsors.form.logoUrl')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="https://example.com/logo.png" data-testid="input-sponsor-logoUrl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sponsors.form.website')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="https://example.com" data-testid="input-sponsor-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sponsors.form.city')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-sponsor-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sponsors.form.contactEmail')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} type="email" data-testid="input-sponsor-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sponsors.form.contactPhone')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-sponsor-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sponsors.form.description')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} rows={4} data-testid="textarea-sponsor-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sponsors.form.descriptionAr')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} rows={4} data-testid="textarea-sponsor-descriptionAr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createSponsorMutation.isPending || updateSponsorMutation.isPending}
                    data-testid="button-submit-sponsor"
                  >
                    {(createSponsorMutation.isPending || updateSponsorMutation.isPending) && (
                      <LoadingSpinner />
                    )}
                    {isEditMode ? t('common.update') : t('common.create')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/sponsors')}
                    data-testid="button-cancel-sponsor"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
