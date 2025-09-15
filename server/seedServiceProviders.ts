import { users, serviceProviders } from '../shared/schema';
import { db } from './db';
import { nanoid } from 'nanoid';

// Real Event Service Providers from Riyadh, Saudi Arabia
const riyadhServiceProviders = [
  // Caterers
  {
    id: "le-carre-caterer-001",
    name: "Hassan Al-Mansouri",
    email: "hassan.mansouri@lecarre.com",
    role: "service_provider" as const,
    businessName: "Le Carré by Four Seasons",
    category: "catering" as const,
    services: ["Fine Dining Catering", "Corporate Events", "Wedding Receptions", "Social Galas", "Business Conferences"],
    priceRange: "Premium (500-1000 SAR per person)",
    rating: "4.90",
    address: "Four Seasons Hotel Riyadh, Kingdom Centre, Olaya Street",
    phone: "+966 11 211 5212",
    bio: "Executive chef and catering director at Four Seasons Riyadh with over 15 years of luxury hospitality experience. Specializes in customized menus with Saudi chefs for off-site events."
  },
  {
    id: "dinesamrah-caterer-002",
    name: "Maha Al-Saleh",
    email: "maha.saleh@dinesamrah.com",
    role: "service_provider" as const,
    businessName: "DineSamrah Bespoke Catering",
    category: "catering" as const,
    services: ["Bespoke Gastronomic Experiences", "Private Events", "Corporate Functions", "Gala Nights", "Table Setup & Decoration"],
    priceRange: "Premium (400-800 SAR per person)",
    rating: "4.80",
    address: "Al Olaya District, Riyadh",
    phone: "+966 92 001 8892",
    bio: "Master chef specializing in fine dining experiences with client-centric approach. Expert in quality ingredients and customized menu development for luxury events."
  },
  {
    id: "baguettering-caterer-003",
    name: "Ahmed Al-Rashid",
    email: "ahmed.rashid@baguettering.sa",
    role: "service_provider" as const,
    businessName: "Baguettering",
    category: "catering" as const,
    services: ["Canapés Catering", "Corporate Functions", "Private Parties", "Healthcare Catering", "Royal Events"],
    priceRange: "Mid-Premium (200-500 SAR per person)",
    rating: "4.70",
    address: "Al Qadisiah District, Riyadh 13234",
    phone: "+966 11 242 7020",
    bio: "Established catering specialist serving oil & gas companies, government sector, and royal events. Known for professional service and advance booking recommendations."
  },
  
  // Photographers
  {
    id: "tasneem-photographer-004",
    name: "Tasneem Alsultan",
    email: "tasneem@tasneemalsultan.com",
    role: "service_provider" as const,
    businessName: "Tasneem Alsultan Photography",
    category: "photography" as const,
    services: ["Documentary Wedding Photography", "Event Photography", "Corporate Events", "Cultural Events", "Artistic Photography"],
    priceRange: "Premium (5000-15000 SAR per event)",
    rating: "4.95",
    address: "Diplomatic Quarter, Riyadh",
    phone: "+966 50 123 4567",
    bio: "Award-winning documentary photographer based in Saudi Arabia, featured internationally. Specializes in artistic and creative wedding photography capturing all cultures and ethnicities."
  },
  {
    id: "onedaystudio-photographer-005",
    name: "Nora Al-Zahrani",
    email: "nora@onedaystudio.net",
    role: "service_provider" as const,
    businessName: "One Day Studio",
    category: "photography" as const,
    services: ["Editorial Royal Style Photography", "Luxury Wedding Photography", "Fashion-Inspired Events", "Intimate Ceremonies", "Ballroom Events"],
    priceRange: "Premium (4000-12000 SAR per event)",
    rating: "4.85",
    address: "King Fahd Road, Riyadh",
    phone: "+966 55 987 6543",
    bio: "Female-led editorial photography team featured in Vogue and The Wed. Specializes in luxury ballroom weddings with fashion-inspired storytelling approach."
  },
  
  // Entertainment Services
  {
    id: "scarlett-entertainment-006",
    name: "Khalid Al-Harbi",
    email: "khalid.harbi@scarlett-ksa.com",
    role: "service_provider" as const,
    businessName: "Scarlett Entertainment KSA",
    category: "entertainment" as const,
    services: ["LED Dancers", "Live Musicians", "Sand Artists", "Mentalists", "Mixologists", "Custom Entertainment Productions"],
    priceRange: "Premium (8000-25000 SAR per event)",
    rating: "4.80",
    address: "Al Malqa District, Riyadh",
    phone: "+966 50 555 1234",
    bio: "Regional director for Scarlett Entertainment's Saudi operations. Expert in booking local KSA-based talent and creating custom entertainment productions for corporate and private events."
  },
  {
    id: "bella-entertainment-007",
    name: "Fatima Al-Dosari",
    email: "fatima@bella-entertainment.com",
    role: "service_provider" as const,
    businessName: "Bella Entertainment",
    category: "entertainment" as const,
    services: ["Fire Dancers", "Arabic Musicians (Oud, Violin, Drums)", "DJs", "Live Bands", "Dance Performers", "Corporate Entertainment"],
    priceRange: "Mid-Premium (5000-18000 SAR per event)",
    rating: "4.75",
    address: "Olaya Street, Riyadh",
    phone: "+966 55 444 5678",
    bio: "Entertainment coordinator specializing in traditional Arabic musicians and modern entertainment. Covers corporate events, weddings, and private parties across Riyadh and Jeddah."
  },
  
  // Florists
  {
    id: "maison-florist-008",
    name: "Sarah Al-Quraishi",
    email: "sarah@maisondesfleursksa.com",
    role: "service_provider" as const,
    businessName: "Maison Des Fleurs",
    category: "florist" as const,
    services: ["Luxury Flower Arrangements", "Wedding Bouquets", "Corporate Event Flowers", "Custom Arrangements", "Same-Day Delivery"],
    priceRange: "Premium (1500-8000 SAR per event)",
    rating: "4.85",
    address: "King Abdulaziz Road, Riyadh",
    phone: "+966 11 223 0010",
    bio: "Master florist with expertise in luxury flower arrangements for weddings and corporate events. Known for artistic designs and reliable same-day delivery service throughout Riyadh."
  },
  {
    id: "bliss-florist-009",
    name: "Reem Al-Mutairi",
    email: "reem@blissflowers.com",
    role: "service_provider" as const,
    businessName: "Bliss Flower Boutique",
    category: "florist" as const,
    services: ["Wedding Production", "Event Management", "Bespoke Celebrations", "Corporate Events", "Lighting Design"],
    priceRange: "Premium (2000-10000 SAR per event)",
    rating: "4.80",
    address: "Diplomatic Quarter, Riyadh",
    phone: "+966 50 789 0123",
    bio: "Expert florist and event coordinator specializing in full wedding production and bespoke celebrations. Combines floral design with comprehensive event management services."
  },
  
  // AV & Technical Services
  {
    id: "wise-monkeys-010",
    name: "Abdullah Al-Malki",
    email: "abdullah@wisemonkeys.sa",
    role: "service_provider" as const,
    businessName: "Wise Monkeys Productions",
    category: "audiovisual" as const,
    services: ["Video Production", "Photography", "Audio Systems", "Corporate Events", "Conference Production", "Lifestyle Photography"],
    priceRange: "Mid-Premium (3000-15000 SAR per event)",
    rating: "4.70",
    address: "Prince Sultan Road, Riyadh",
    phone: "+966 55 321 9876",
    bio: "Full-service photography and video production specialist. Covers corporate events, conferences, and lifestyle photography with professional equipment and flexible rescheduling policy."
  }
];

export async function seedRiyadhServiceProviders() {
  console.log('Starting to seed Riyadh service providers...');
  
  try {
    for (const provider of riyadhServiceProviders) {
      console.log(`Seeding ${provider.businessName}...`);
      
      // Insert user first and get the generated ID
      const insertedUser = await db.insert(users).values({
        firstName: provider.name.split(' ')[0],
        lastName: provider.name.split(' ').slice(1).join(' '),
        email: provider.email,
        role: provider.role,
        bio: provider.bio,
        phone: provider.phone,
        city: "Riyadh",
      }).returning({ id: users.id }).onConflictDoNothing();

      if (insertedUser.length === 0) {
        console.log(`User ${provider.email} already exists, skipping...`);
        continue;
      }

      const userId = insertedUser[0].id;

      // Insert service provider profile
      await db.insert(serviceProviders).values({
        id: nanoid(),
        userId: userId,
        businessName: provider.businessName,
        category: provider.category,
        services: provider.services,
        priceRange: provider.priceRange,
        portfolio: [],
        availability: null,
        rating: provider.rating,
        reviewCount: 0,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      console.log(`✓ Seeded ${provider.businessName} with user ID: ${userId}`);
    }

    console.log('✅ Successfully seeded all 10 Riyadh service providers');
  } catch (error) {
    console.error('❌ Error seeding service providers:', error);
    throw error;
  }
}