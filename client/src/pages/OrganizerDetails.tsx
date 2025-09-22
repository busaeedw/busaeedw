import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading';
import { Calendar, MapPin, Users, Star, Phone, Mail, Globe, Building, MessageSquare } from 'lucide-react';

interface Organizer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  bio?: string;
  phone?: string;
  city?: string;
  businessName?: string;
  businessNameAr?: string;
  category?: string;
  specialties?: string[];
  yearsExperience?: number;
  priceRange?: string;
  portfolio?: string[];
  website?: string;
  socialMedia?: any;
  availableServices?: string[];
  businessDescription?: string;
  businessDescriptionAr?: string;
  rating?: number;
  reviewCount?: number;
  totalEventsOrganized?: number;
  verified?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function OrganizerDetails() {
  const { id } = useParams();
  const { t } = useLanguage();

  const { data: organizer, isLoading, error } = useQuery<Organizer>({
    queryKey: ['/api/organizers', id],
    enabled: !!id,
  });

  // Query for organizer's events
  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/events', { organizerId: id }],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </main>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('organizers.detail.notfound')}</h2>
            <p className="text-gray-600">{t('organizers.detail.notfound.desc')}</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organizer Header */}
        <Card className="bg-white mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <Avatar className="w-24 h-24 mx-auto md:mx-0">
                <AvatarImage src={organizer.profileImageUrl || `https://avatar.vercel.sh/${organizer.email}`} />
                <AvatarFallback className="text-xl">
                  {organizer.firstName?.[0]}{organizer.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="organizer-detail-title">
                      {organizer.businessName || `${organizer.firstName} ${organizer.lastName}`}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {organizer.firstName} {organizer.lastName}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    {organizer.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {t('organizers.verified')}
                      </Badge>
                    )}
                    {organizer.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        {t('organizers.featured')}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center justify-center md:justify-start text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{organizer.totalEventsOrganized || 0} {t('organizers.events.organized')}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start text-sm text-gray-600">
                    <Star className="h-4 w-4 mr-2" />
                    <span>{organizer.rating || "0.0"} ({organizer.reviewCount || 0} {t('organizers.reviews')})</span>
                  </div>
                  {organizer.city && (
                    <div className="flex items-center justify-center md:justify-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{organizer.city}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {organizer.bio && (
                  <p className="text-gray-700 mb-6">{organizer.bio}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-saudi-green hover:bg-saudi-green/90" data-testid="contact-organizer-button">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('organizers.contact')}
                  </Button>
                  <Button variant="outline" data-testid="view-events-button">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('organizers.view.events')} ({events.length})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {t('organizers.business.info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('organizers.category')}</label>
                    <p className="capitalize text-gray-900">{organizer.category === 'general' ? t('organizers.general.events') : organizer.category === 'corporate' ? t('organizers.corporate.events') : organizer.category === 'wedding' ? t('organizers.wedding.events') : organizer.category === 'exhibition' ? t('organizers.exhibition.events') : (organizer.category || 'General') + ' Events'}</p>
                  </div>
                  {organizer.priceRange && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('organizers.price.range')}</label>
                      <p className="text-gray-900">{organizer.priceRange} SAR</p>
                    </div>
                  )}
                </div>
                
                {organizer.specialties && organizer.specialties.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">{t('organizers.specialties')}</label>
                    <div className="flex flex-wrap gap-2">
                      {organizer.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {specialty.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {organizer.businessDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('organizers.description')}</label>
                    <p className="text-gray-700 mt-1">{organizer.businessDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {t('organizers.recent.events')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-gray-600">{t('organizers.no.events')}</p>
                ) : (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="border-l-4 border-saudi-green pl-4">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(event.startDate).toLocaleDateString()}
                          <Users className="h-3 w-3 ml-4 mr-1" />
                          {event.currentAttendees} attendees
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('organizers.contact.info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="text-sm text-gray-900">{organizer.email}</span>
                </div>
                {organizer.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="text-sm text-gray-900">{organizer.phone}</span>
                  </div>
                )}
                {organizer.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-3 text-gray-400" />
                    <a 
                      href={organizer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-saudi-green hover:underline"
                    >
                      {t('organizers.visit.website')}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('organizers.quick.stats')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('organizers.events.count')}</span>
                  <span className="text-sm font-medium">{organizer.totalEventsOrganized || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('organizers.average.rating')}</span>
                  <span className="text-sm font-medium">{organizer.rating || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('organizers.total.reviews')}</span>
                  <span className="text-sm font-medium">{organizer.reviewCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('organizers.member.since')}</span>
                  <span className="text-sm font-medium">
                    {organizer.createdAt ? new Date(organizer.createdAt).getFullYear() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}