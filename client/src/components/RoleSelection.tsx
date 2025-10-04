import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarCheck, Ticket, Handshake, Shield } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function RoleSelection() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest('/api/auth/user/role', {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRoleSelection = (role: string) => {
    if (!isAuthenticated) {
      // Redirect to login with role parameter
      window.location.href = `/api/login?role=${role}`;
      return;
    }

    if ((user as any)?.role !== role) {
      updateRoleMutation.mutate(role);
    }
  };

  const roles = [
    {
      id: 'organizer',
      title: t('roles.organizer.title'),
      description: t('roles.organizer.description'),
      features: [
        t('roles.organizer.features.1'),
        t('roles.organizer.features.2'),
        t('roles.organizer.features.3'),
        t('roles.organizer.features.4'),
      ],
      icon: CalendarCheck,
      gradient: 'from-purple-primary/10 to-purple-primary/20',
      iconBg: 'bg-purple-primary',
      cta: t('roles.cta.start'),
    },
    {
      id: 'attendee',
      title: t('roles.attendee.title'),
      description: t('roles.attendee.description'),
      features: [
        t('roles.attendee.features.1'),
        t('roles.attendee.features.2'),
        t('roles.attendee.features.3'),
        t('roles.attendee.features.4'),
      ],
      icon: Ticket,
      gradient: 'from-blue-500/10 to-blue-500/20',
      iconBg: 'bg-blue-500',
      cta: t('roles.cta.join'),
    },
    {
      id: 'service_provider',
      title: t('roles.provider.title'),
      description: t('roles.provider.description'),
      features: [
        t('roles.provider.features.1'),
        t('roles.provider.features.2'),
        t('roles.provider.features.3'),
        t('roles.provider.features.4'),
      ],
      icon: Handshake,
      gradient: 'from-amber-500/10 to-amber-500/20',
      iconBg: 'bg-amber-500',
      cta: t('roles.cta.sell'),
    },
    {
      id: 'admin',
      title: t('roles.admin.title'),
      description: t('roles.admin.description'),
      features: [
        t('roles.admin.features.1'),
        t('roles.admin.features.2'),
        t('roles.admin.features.3'),
        t('roles.admin.features.4'),
      ],
      icon: Shield,
      gradient: 'from-purple-secondary/10 to-purple-secondary/20',
      iconBg: 'bg-purple-secondary',
      cta: t('roles.cta.admin'),
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('roles.title')}
          </h2>
          <p className="text-xl text-muted-foreground">{t('roles.subtitle')}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isCurrentRole = (user as any)?.role === role.id;
            
            return (
              <Card
                key={role.id}
                className={`relative bg-gradient-to-br ${role.gradient} rounded-2xl p-8 text-center hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer border ${
                  isCurrentRole ? 'ring-2 ring-purple-primary' : 'border-border'
                }`}
                onClick={() => handleRoleSelection(role.id)}
              >
                <CardContent className="p-0">
                  {isCurrentRole && (
                    <div className="absolute top-2 right-2 bg-purple-primary text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </div>
                  )}
                  
                  <div className={`${role.iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className="text-white h-8 w-8" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">
                    {role.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">{role.description}</p>
                  
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
                    {role.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${role.iconBg} hover:opacity-90 transition-colors`}
                    disabled={updateRoleMutation.isPending}
                  >
                    {updateRoleMutation.isPending && (user as any)?.role === role.id ? 'Updating...' : role.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
