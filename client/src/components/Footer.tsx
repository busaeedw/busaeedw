import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'wouter';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();

  const footerLinks = {
    organizers: [
      { href: '/events/create', label: language === 'ar' ? 'إنشاء فعالية' : 'Create Event' },
      { href: '/manage-tickets', label: language === 'ar' ? 'إدارة التذاكر' : 'Manage Tickets' },
      { href: '/analytics', label: language === 'ar' ? 'التحليلات' : 'Analytics' },
      { href: '/pricing', label: language === 'ar' ? 'التسعير' : 'Pricing' },
    ],
    attendees: [
      { href: '/events', label: language === 'ar' ? 'البحث عن فعاليات' : 'Find Events' },
      { href: '/my-tickets', label: language === 'ar' ? 'تذاكري' : 'My Tickets' },
      { href: '/calendar', label: language === 'ar' ? 'تقويم الفعاليات' : 'Event Calendar' },
      { href: '/reviews', label: language === 'ar' ? 'المراجعات' : 'Reviews' },
    ],
    support: [
      { href: '/help', label: language === 'ar' ? 'مركز المساعدة' : 'Help Center' },
      { href: '/contact', label: language === 'ar' ? 'اتصل بنا' : 'Contact Us' },
      { href: '/privacy', label: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' },
      { href: '/terms', label: language === 'ar' ? 'شروط الخدمة' : 'Terms of Service' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-bold text-primary-400">EventHub</h3>
              <span className="text-gold-400 ml-2 text-sm font-medium">
                {language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
              </span>
            </div>
            <p className="text-gray-300 mb-6">
              {language === 'ar'
                ? 'منصة إدارة الفعاليات الرائدة التي تربط المنظمين والحضور ومقدمي الخدمات في جميع أنحاء المملكة العربية السعودية.'
                : 'The premier event management platform connecting organizers, attendees, and service providers across the Kingdom of Saudi Arabia.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">
              {language === 'ar' ? 'للمنظمين' : 'For Organizers'}
            </h4>
            <ul className="space-y-2 text-gray-300">
              {footerLinks.organizers.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">
              {language === 'ar' ? 'للحضور' : 'For Attendees'}
            </h4>
            <ul className="space-y-2 text-gray-300">
              {footerLinks.attendees.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">
              {language === 'ar' ? 'الدعم' : 'Support'}
            </h4>
            <ul className="space-y-2 text-gray-300">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 EventHub Saudi Arabia.{' '}
            {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved.'} |{' '}
            {language === 'ar'
              ? 'صنع بـ ❤️ في المملكة العربية السعودية'
              : 'Made with ❤️ in the Kingdom of Saudi Arabia'}
          </p>
        </div>
      </div>
    </footer>
  );
}
