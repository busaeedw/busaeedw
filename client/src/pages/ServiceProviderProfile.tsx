import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/loading';
import { Star, MessageSquare, MapPin, Calendar, CheckCircle } from 'lucide-react';

export default function ServiceProviderProfile() {
  const { id } = useParams();
  const { t } = useLanguage();

  const { data: provider, isLoading: providerLoading, error: providerError } = useQuery({
    queryKey: ['/api/service-providers', id],
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews/service_provider', id],
    enabled: !!id,
  });

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner className="mx-auto" size="lg" />
        </div>
      </div>
    );
  }

  if (providerError || !provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
            <p className="text-gray-600 mb-8">The service provider you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Provider Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={provider.user?.profileImageUrl} 
                      alt={provider.businessName}
                    />
                    <AvatarFallback className="text-2xl">
                      {provider.businessName?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {provider.businessName}
                      </h1>
                      {provider.verified && (
                        <CheckCircle className="h-6 w-6 text-saudi-green" />
                      )}
                    </div>
                    <Badge className="mb-4 capitalize">
                      {provider.category}
                    </Badge>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        <div className="flex text-gold-400">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(provider.rating || 0)
                                  ? 'fill-current'
                                  : ''
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600 ml-2">
                          {provider.rating || 0} ({provider.reviewCount || 0} {t('services.reviews')})
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {provider.user?.bio || 'Professional service provider in Saudi Arabia'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {provider.services && provider.services.length > 0 ? (
                    provider.services.map((service: string, index: number) => (
                      <div key={index} className="flex items-center p-4 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-saudi-green mr-3" />
                        <span>{service}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">No specific services listed</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            {provider.portfolio && provider.portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provider.portfolio.map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Client Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <LoadingSkeleton lines={3} />
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
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
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-saudi-green mb-2">
                    {provider.priceRange || 'Contact for pricing'}
                  </div>
                  <p className="text-gray-600 text-sm">Starting price</p>
                </div>

                {provider.user?.phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{provider.user.phone}</p>
                  </div>
                )}

                {provider.user?.email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{provider.user.email}</p>
                  </div>
                )}

                {provider.user?.city && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{provider.user.city}, Saudi Arabia</span>
                  </div>
                )}

                <Button className="w-full bg-saudi-green hover:bg-saudi-green/90">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>

                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-medium">{provider.rating || 0}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews:</span>
                  <span className="font-medium">{provider.reviewCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{provider.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified:</span>
                  <span className="font-medium">
                    {provider.verified ? (
                      <CheckCircle className="h-4 w-4 text-saudi-green inline" />
                    ) : (
                      'Not verified'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">
                    {new Date(provider.createdAt).getFullYear()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            {provider.availability && (
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Contact the provider to check availability for your event date.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
