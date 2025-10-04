import { useLanguage } from '@/hooks/useLanguage';
import { useQuery } from '@tanstack/react-query';
import { LoadingSkeleton } from '@/components/ui/loading';

export function Statistics() {
  const { t } = useLanguage();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const defaultStats = {
    totalEvents: 2500,
    totalAttendees: 150000,
    totalProviders: 300,
    cities: 13,
  };

  const displayStats = stats || defaultStats;

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="p-6">
                <LoadingSkeleton lines={2} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl lg:text-5xl font-bold text-saudi-green mb-2">
              {displayStats.totalEvents?.toLocaleString() || '2,500'}+
            </div>
            <p className="text-gray-600 font-medium">{t('stats.events')}</p>
          </div>
          <div className="p-6">
            <div className="text-4xl lg:text-5xl font-bold text-gold-500 mb-2">
              {displayStats.totalAttendees
                ? `${Math.floor(displayStats.totalAttendees / 1000)}K`
                : '150K'}+
            </div>
            <p className="text-gray-600 font-medium">{t('stats.attendees')}</p>
          </div>
          <div className="p-6">
            <div className="text-4xl lg:text-5xl font-bold text-saudi-green mb-2">
              {displayStats.totalProviders?.toLocaleString() || '300'}+
            </div>
            <p className="text-gray-600 font-medium">{t('stats.providers')}</p>
          </div>
          <div className="p-6">
            <div className="text-4xl lg:text-5xl font-bold text-gold-500 mb-2">
              {displayStats.cities || '13'}
            </div>
            <p className="text-gray-600 font-medium">{t('stats.cities')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
