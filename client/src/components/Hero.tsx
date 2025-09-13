import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Calendar, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';

export function Hero() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative bg-gradient-to-r from-saudi-green via-primary-600 to-primary-500 hero-pattern">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {t('hero.title')}{' '}
              <span className="text-gold-400">{t('hero.title.highlight')}</span>
            </h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gold-500 text-gray-900 hover:bg-gold-400 transition-all transform hover:scale-105 shadow-lg text-lg px-8 py-4"
                onClick={() => {
                  if (isAuthenticated) {
                    window.location.href = '/events/create';
                  } else {
                    window.location.href = '/api/login';
                  }
                }}
              >
                <Calendar className="mr-2 h-5 w-5" />
                {t('hero.cta.create')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 transition-all text-lg px-8 py-4"
                onClick={() => {
                  if (isAuthenticated) {
                    window.location.href = '/events';
                  } else {
                    window.location.href = '/api/login';
                  }
                }}
              >
                <Search className="mr-2 h-5 w-5" />
                {t('hero.cta.find')}
              </Button>
            </div>
          </div>
          
          <div className="mt-10 lg:mt-0">
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Modern event venue in Saudi Arabia"
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
