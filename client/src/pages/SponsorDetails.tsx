import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Globe, MapPin, Mail, Phone, Star, Edit } from 'lucide-react';
import { type Sponsor } from '@shared/schema';

export default function SponsorDetails() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const { data: sponsor, isLoading } = useQuery<Sponsor>({
    queryKey: ['/api/sponsors', id],
  });

  const canEdit = user && (user.role === 'admin' || (user.role === 'sponsor' && sponsor?.userId === user.id));

  if (isLoading) {
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

  if (!sponsor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold">Sponsor Not Found</h1>
          <p className="mt-2 text-muted-foreground">The sponsor you're looking for doesn't exist.</p>
          <Link href="/sponsors">
            <Button className="mt-4">Back to Sponsors</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {sponsor.logoUrl ? (
              <img
                src={sponsor.logoUrl}
                alt={language === 'ar' && sponsor.nameAr ? sponsor.nameAr : sponsor.name}
                className="h-24 w-24 object-contain rounded"
                data-testid="img-sponsor-logo"
              />
            ) : (
              <div className="h-24 w-24 bg-muted rounded flex items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-sponsor-name">
                {language === 'ar' && sponsor.nameAr ? sponsor.nameAr : sponsor.name}
              </h1>
              {sponsor.isFeatured && (
                <div className="flex items-center mt-2 text-amber-600">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  <span>Featured Sponsor</span>
                </div>
              )}
            </div>
          </div>
          {canEdit && (
            <Link href={`/sponsors/${id}/edit`}>
              <Button variant="outline" data-testid="button-edit-sponsor">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6">
          {(sponsor.description || sponsor.descriptionAr) && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground" data-testid="text-sponsor-description">
                  {language === 'ar' && sponsor.descriptionAr ? sponsor.descriptionAr : sponsor.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sponsor.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-sponsor-website"
                  >
                    {sponsor.website}
                  </a>
                </div>
              )}
              {sponsor.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${sponsor.contactEmail}`} className="text-primary hover:underline">
                    {sponsor.contactEmail}
                  </a>
                </div>
              )}
              {sponsor.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${sponsor.contactPhone}`} className="text-primary hover:underline">
                    {sponsor.contactPhone}
                  </a>
                </div>
              )}
              {sponsor.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{sponsor.city}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
