import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { apiRequest } from '@/lib/queryClient';
import { Plus, X, Building2 } from 'lucide-react';
import { type Sponsor } from '@shared/schema';

interface EventSponsorManagerProps {
  eventId: string;
  canManage?: boolean;
}

type EventSponsor = {
  sponsorId: string;
  eventId: string;
  displayOrder: number | null;
  sponsor: Sponsor;
};

export function EventSponsorManager({ eventId, canManage = false }: EventSponsorManagerProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>('');

  // Fetch event sponsors
  const { data: eventSponsors = [], isLoading: sponsorsLoading } = useQuery<EventSponsor[]>({
    queryKey: ['/api/events', eventId, 'sponsors'],
  });

  // Fetch available sponsors
  const { data: allSponsors = [] } = useQuery<Sponsor[]>({
    queryKey: ['/api/sponsors', { search: '', city: '' }],
    enabled: isDialogOpen,
  });

  // Get sponsors not already attached
  const availableSponsors = allSponsors.filter(
    (sponsor) => !eventSponsors.some((es) => es.sponsorId === sponsor.id)
  );

  const attachSponsorMutation = useMutation({
    mutationFn: async (sponsorId: string) => {
      return await apiRequest(`/api/events/${eventId}/sponsors`, {
        method: 'POST',
        body: JSON.stringify({ sponsorId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      toast({
        title: 'Success',
        description: 'Sponsor added to event successfully',
      });
      setIsDialogOpen(false);
      setSelectedSponsorId('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add sponsor',
        variant: 'destructive',
      });
    },
  });

  const detachSponsorMutation = useMutation({
    mutationFn: async (sponsorId: string) => {
      return await apiRequest(`/api/events/${eventId}/sponsors/${sponsorId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      toast({
        title: 'Success',
        description: 'Sponsor removed from event successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove sponsor',
        variant: 'destructive',
      });
    },
  });

  const handleAddSponsor = () => {
    if (selectedSponsorId) {
      attachSponsorMutation.mutate(selectedSponsorId);
    }
  };

  const handleRemoveSponsor = (sponsorId: string) => {
    if (confirm('Are you sure you want to remove this sponsor from the event?')) {
      detachSponsorMutation.mutate(sponsorId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Event Sponsors</CardTitle>
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-event-sponsor">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sponsor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Sponsor to Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Sponsor</label>
                    <Select value={selectedSponsorId} onValueChange={setSelectedSponsorId}>
                      <SelectTrigger data-testid="select-sponsor">
                        <SelectValue placeholder="Choose a sponsor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSponsors.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No available sponsors
                          </div>
                        ) : (
                          availableSponsors.map((sponsor) => (
                            <SelectItem key={sponsor.id} value={sponsor.id}>
                              {language === 'ar' && sponsor.nameAr ? sponsor.nameAr : sponsor.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddSponsor}
                    disabled={!selectedSponsorId || attachSponsorMutation.isPending}
                    className="w-full"
                    data-testid="button-confirm-add-sponsor"
                  >
                    {attachSponsorMutation.isPending ? 'Adding...' : 'Add Sponsor'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sponsorsLoading ? (
          <div className="text-center py-4">Loading sponsors...</div>
        ) : eventSponsors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No sponsors added to this event yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventSponsors.map((eventSponsor) => (
              <div
                key={eventSponsor.sponsorId}
                className="flex items-center justify-between p-3 border rounded-lg"
                data-testid={`sponsor-item-${eventSponsor.sponsorId}`}
              >
                <div className="flex items-center gap-3">
                  {eventSponsor.sponsor.logoUrl ? (
                    <img
                      src={eventSponsor.sponsor.logoUrl}
                      alt={language === 'ar' && eventSponsor.sponsor.nameAr ? eventSponsor.sponsor.nameAr : eventSponsor.sponsor.name}
                      className="h-12 w-12 object-contain rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {language === 'ar' && eventSponsor.sponsor.nameAr ? eventSponsor.sponsor.nameAr : eventSponsor.sponsor.name}
                    </p>
                    {eventSponsor.sponsor.city && (
                      <p className="text-sm text-muted-foreground">{eventSponsor.sponsor.city}</p>
                    )}
                  </div>
                  {eventSponsor.sponsor.isFeatured && (
                    <Badge variant="secondary" className="ml-2">
                      Featured
                    </Badge>
                  )}
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSponsor(eventSponsor.sponsorId)}
                    disabled={detachSponsorMutation.isPending}
                    data-testid={`button-remove-sponsor-${eventSponsor.sponsorId}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
