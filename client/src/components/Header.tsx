import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe, User, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/logout", {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      // Clear all queries to ensure fresh state
      queryClient.clear();
      // Force navigation to homepage
      setLocation("/");
      // Force a page reload to ensure clean state
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { 
      href: isAuthenticated ? '/events' : '/#events', 
      label: t('nav.events'),
      isInternal: !isAuthenticated
    },
    { href: '/venues', label: t('nav.venues') },
    ...(isAuthenticated ? [{ 
      href: '/ai-assistant', 
      label: t('nav.ai'),
      requireAuth: true
    }] : []),
  ];

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-saudi-green">EventHub</h1>
                <p className="text-xs text-gold-500 font-medium">
                  {language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              if (item.isInternal) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      location === item.href
                        ? 'text-saudi-green border-b-2 border-saudi-green'
                        : 'text-gray-700 hover:text-saudi-green'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location === item.href
                      ? 'text-saudi-green border-b-2 border-saudi-green'
                      : 'text-gray-700 hover:text-saudi-green'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            
            {/* Browse Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
                location.startsWith('/browse')
                  ? 'text-saudi-green border-b-2 border-saudi-green'
                  : 'text-gray-700 hover:text-saudi-green'
              }`}>
                {t('nav.browse')}
                <ChevronDown className="h-4 w-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/browse/events" data-testid="browse-events">
                    {language === 'ar' ? 'الفعاليات' : 'Events'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/browse/venues" data-testid="browse-venues">
                    {t('nav.browse.venues')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/browse/organizers" data-testid="browse-organizers">
                    {t('nav.browse.organizers')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/browse/providers" data-testid="browse-providers">
                    {t('nav.browse.providers')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/browse/users" data-testid="browse-users">
                    {t('nav.browse.users')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Language Toggle */}
          <div className="fixed top-4 right-4 z-50 md:relative md:top-0 md:right-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLanguageToggle}
              className="rounded-full bg-white shadow-lg"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'عربي' : 'English'}
            </Button>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-xs" data-testid="text-username">{(user as any).firstName && (user as any).lastName ? `${(user as any).firstName} ${(user as any).lastName}` : (user as any).email}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center cursor-pointer"
                        data-testid="button-logout"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('auth.signout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" asChild data-testid="button-signup">
                      <Link href="/register">{t('auth.signup')}</Link>
                    </Button>
                    <Button asChild className="bg-saudi-green hover:bg-saudi-green/90" data-testid="button-signin">
                      <Link href="/login">{t('auth.signin')}</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"}>
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => {
                  if (item.isInternal) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-gray-900 hover:text-saudi-green"
                      >
                        {item.label}
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-gray-900 hover:text-saudi-green"
                    >
                      {item.label}
                    </Link>
                  );
                })}
                {!isLoading && (
                  <>
                    {isAuthenticated && user ? (
                      <div className="border-t pt-4 space-y-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-lg font-medium text-gray-900 hover:text-saudi-green"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block text-lg font-medium text-gray-900 hover:text-saudi-green"
                          data-testid="button-mobile-logout"
                        >
                          {t('auth.signout')}
                        </button>
                      </div>
                    ) : (
                      <div className="border-t pt-4 space-y-2">
                        <Button variant="ghost" asChild className="w-full justify-start" data-testid="button-mobile-signup">
                          <Link href="/register">{t('auth.signup')}</Link>
                        </Button>
                        <Button asChild className="w-full bg-saudi-green hover:bg-saudi-green/90" data-testid="button-mobile-signin">
                          <Link href="/login">{t('auth.signin')}</Link>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
