
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Venue } from "@shared/schema";

export default function VenueEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    city: "",
    location: "",
    imageUrl: "",
    venueType: "",
  });

  const { data: venue, isLoading } = useQuery<Venue>({
    queryKey: [`/api/venues/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || "",
        nameAr: venue.nameAr || "",
        city: venue.city || "",
        location: venue.location || "",
        imageUrl: venue.imageUrl || "",
        venueType: venue.venueType || "",
      });
    }
  }, [venue]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Venue>) => {
      return await apiRequest(`/api/venues/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: "Venue updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/venues/${id}`] });
      setLocation(`/venues/${id}`);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || "Failed to update venue",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/venues">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('venue.details.back')}
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('venue.details.notFound')}</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href={`/venues/${id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Venue
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-saudi-green">Edit Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Venue Name (English)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameAr">Venue Name (Arabic)</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => handleChange('nameAr', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venueType">Venue Type</Label>
                  <Input
                    id="venueType"
                    value={formData.venueType}
                    onChange={(e) => handleChange('venueType', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="bg-saudi-green hover:bg-saudi-green/90"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Venue'}
                </Button>
                <Link href={`/venues/${id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
