import { useLanguage } from '@/hooks/useLanguage';
import { Shield, Globe, Smartphone, TrendingUp, Headphones, MapPin } from 'lucide-react';

export function PlatformFeatures() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.desc'),
    },
    {
      icon: Globe,
      title: t('features.language.title'),
      description: t('features.language.desc'),
    },
    {
      icon: Smartphone,
      title: t('features.mobile.title'),
      description: t('features.mobile.desc'),
    },
    {
      icon: TrendingUp,
      title: t('features.analytics.title'),
      description: t('features.analytics.desc'),
    },
    {
      icon: Headphones,
      title: t('features.support.title'),
      description: t('features.support.desc'),
    },
    {
      icon: MapPin,
      title: t('features.local.title'),
      description: t('features.local.desc'),
    },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-br from-saudi-green via-primary-700 to-primary-800 text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-green-100">{t('features.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="bg-gold-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-green-100">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
