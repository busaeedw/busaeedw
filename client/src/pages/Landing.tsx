import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { RoleSelection } from '@/components/RoleSelection';
import { FeaturedEvents } from '@/components/FeaturedEvents';
import { ServiceProviders } from '@/components/ServiceProviders';
import { PlatformFeatures } from '@/components/PlatformFeatures';
import { Statistics } from '@/components/Statistics';
import { Footer } from '@/components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <RoleSelection />
      <FeaturedEvents />
      <ServiceProviders />
      <PlatformFeatures />
      <Statistics />
      <Footer />
    </div>
  );
}
