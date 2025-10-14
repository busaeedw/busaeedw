import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar } from 'lucide-react';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative hero-gradient hero-pattern">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t('hero.title')}{' '}
            <span className="text-gold-400">{t('hero.title.highlight')}</span>
          </h1>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gold-500 text-gray-900 hover:bg-gold-400 transition-all transform hover:scale-105 shadow-lg text-lg px-8 py-4"
              onClick={() => {
                window.location.href = '/events';
              }}
              data-testid="hero-events-button"
            >
              <Calendar className="mr-2 h-5 w-5" />
              {t('hero.cta.events')}
            </Button>
            <Button
              size="lg"
              className="bg-gold-500 text-gray-900 hover:bg-gold-400 transition-all transform hover:scale-105 shadow-lg text-lg px-8 py-4"
              onClick={() => {
                window.location.href = '/venues';
              }}
              data-testid="hero-venues-button"
            >
              <MapPin className="mr-2 h-5 w-5" />
              {t('hero.cta.venues')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
