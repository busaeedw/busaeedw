import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Settings, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth({ enabled: true });
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  // Redirect to homepage if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to homepage instead of login to prevent auto-login loop
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

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

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      attendee: t('auth.register.role.attendee'),
      organizer: t('auth.register.role.organizer'),
      venue: t('auth.register.role.venue'),
      services: t('auth.register.role.services'),
      admin: 'Admin'
    };
    return roleMap[role] || role;
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('profile.title')}
          </h1>
          <p className="text-gray-600">
            {t('profile.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                    {getInitials(user.firstName, user.lastName, user.email)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.email}
              </CardTitle>
              <div className="flex justify-center mt-2">
                <Badge variant="secondary" className="capitalize">
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.city && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{t('profile.memberSince')} {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>{t('profile.details')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.register.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={user.firstName || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.register.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={user.lastName || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t('auth.register.username')}</Label>
                <Input
                  id="username"
                  value={user.username || ''}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.register.email')}</Label>
                <Input
                  id="email"
                  value={user.email}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t('auth.register.role')}</Label>
                <Input
                  id="role"
                  value={getRoleDisplayName(user.role)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              {user.bio && (
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    value={user.bio}
                    readOnly
                    className="bg-gray-50 min-h-[80px]"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {user.phone && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profile.phone')}</Label>
                    <Input
                      id="phone"
                      value={user.phone}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                )}
                {user.city && (
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('profile.city')}</Label>
                    <Input
                      id="city"
                      value={user.city}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('profile.editNote')}
                </p>
                <Button variant="outline" disabled>
                  <User className="h-4 w-4 mr-2" />
                  {t('profile.editProfile')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}