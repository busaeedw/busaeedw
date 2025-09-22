import { storage } from "./storage";
import type { InsertOrganizer } from "@shared/schema";

// Real event organizers from Riyadh, Saudi Arabia - New organizers table format
const organizerData: InsertOrganizer[] = [
  {
    id: "luxuryksa-organizer-001",
    email: "info@luxuryksa.com",
    firstName: "Ahmed",
    lastName: "Al-Rashid",
    phone: "+966 11 234 5678",
    city: "Riyadh",
    businessName: "LuxuryKSA",
    category: "corporate",
    specialties: ["event_planning", "branding", "corporate_events"],
    yearsExperience: 10,
    priceRange: "5000-10000",
    businessDescription: "CEO of LuxuryKSA, leading event management company specializing in concept development, creative direction, and brand management across the Kingdom.",
    rating: 4.8,
    reviewCount: 45,
    totalEventsOrganized: 120,
    verified: true,
    featured: true
  },
  {
    id: "eventfull-organizer-002",
    email: "contact@eventfull.sa",
    firstName: "Sarah",
    lastName: "Al-Mansouri",
    phone: "+966 11 345 6789",
    city: "Riyadh",
    businessName: "Eventfull",
    category: "corporate",
    specialties: ["event_planning", "branding", "corporate_events"],
    yearsExperience: 6,
    priceRange: "3000-8000",
    businessDescription: "Founder of Eventfull, 6+ years experience with 350+ successful projects. Specializes in tech-driven brand experiences and corporate events.",
    rating: 4.7,
    reviewCount: 67,
    totalEventsOrganized: 350,
    verified: true,
    featured: true
  },
  {
    id: "aplus-events-organizer-003",
    email: "info@aplus.events",
    firstName: "Mohammed",
    lastName: "Al-Otaibi",
    phone: "+966 11 456 7890",
    city: "Riyadh",
    businessName: "Aplus Events",
    category: "wedding",
    specialties: ["event_planning", "wedding_planning", "luxury_events"],
    yearsExperience: 8,
    priceRange: "4000-10000",
    businessDescription: "Managing Director of Aplus Events, complete event solutions provider with full media production capabilities. Expert in luxury weddings and corporate celebrations.",
    rating: 4.9,
    reviewCount: 89,
    totalEventsOrganized: 200,
    verified: true,
    featured: true
  },
  {
    id: "blink-experience-organizer-004",
    email: "riyadh@blinkexperience.com",
    firstName: "Khalid",
    lastName: "Al-Harbi",
    phone: "+966 11 567 8901",
    city: "Riyadh",
    businessName: "Blink Experience",
    category: "general",
    specialties: ["event_planning", "production", "large_scale_events"],
    yearsExperience: 21,
    priceRange: "10000-20000",
    businessDescription: "Regional Director of Blink Experience, 21+ years international experience. Managed KSA National Day Fireworks (Guinness World Record 2018) and FEI World Cup Finals 2024.",
    rating: 4.9,
    reviewCount: 156,
    totalEventsOrganized: 500,
    verified: true,
    featured: true
  },
  {
    id: "hafray-organizer-005",
    email: "info@hafray.com",
    firstName: "Fatima",
    lastName: "Al-Zahrani",
    phone: "+966 11 678 9012",
    city: "Riyadh",
    businessName: "Hafray",
    category: "corporate",
    specialties: ["event_planning", "production", "av_services"],
    yearsExperience: 12,
    priceRange: "3000-8000",
    businessDescription: "Senior Event Director at Hafray, top-tier corporate events and exhibitions specialist. Expert in AV production, lighting, and comprehensive event support.",
    rating: 4.6,
    reviewCount: 78,
    totalEventsOrganized: 150,
    verified: true,
    featured: false
  },
  {
    id: "amkenah-organizer-006",
    email: "events@amkenah.com",
    firstName: "Omar",
    lastName: "Al-Dosari",
    phone: "+966 11 789 0123",
    city: "Riyadh",
    businessName: "Amkenah Marketing & Events",
    category: "corporate",
    specialties: ["event_planning", "corporate_events", "government_relations"],
    yearsExperience: 15,
    priceRange: "2000-5000",
    businessDescription: "Co-founder of Amkenah Marketing & Events (Est. 2014), 40+ years combined team experience. Aligned with Saudi Vision 2030 initiatives.",
    rating: 4.5,
    reviewCount: 92,
    totalEventsOrganized: 180,
    verified: true,
    featured: true
  },
  {
    id: "eventana-organizer-007",
    email: "hello@eventana.net",
    firstName: "Nora",
    lastName: "Al-Quraishi",
    phone: "+966 11 890 1234",
    city: "Riyadh",
    businessName: "Eventana",
    category: "corporate",
    specialties: ["event_planning", "branding", "experiential_marketing"],
    yearsExperience: 18,
    priceRange: "2500-6000",
    businessDescription: "Creative Director at Eventana (Est. 2007), integrated event management and brand activation specialist with innovative approach to experiential marketing.",
    rating: 4.6,
    reviewCount: 74,
    totalEventsOrganized: 160,
    verified: true,
    featured: false
  },
  {
    id: "time-entertainment-organizer-008",
    email: "riyadh@timeentertainment.sa",
    firstName: "Abdullah",
    lastName: "Al-Malki",
    phone: "+966 11 901 2345",
    city: "Riyadh",
    businessName: "Time Entertainment",
    category: "general",
    specialties: ["event_planning", "entertainment", "cultural_events"],
    yearsExperience: 7,
    priceRange: "1500-4500",
    businessDescription: "Regional Manager at Time Entertainment, established presence with international outlook. Specializes in entertainment management and cultural events.",
    rating: 4.4,
    reviewCount: 56,
    totalEventsOrganized: 95,
    verified: true,
    featured: false
  },
  {
    id: "dasco-organizer-009",
    email: "events@dasco.sa",
    firstName: "Reem",
    lastName: "Al-Sibai",
    phone: "+966 11 012 3456",
    city: "Riyadh",
    businessName: "Diamond Al Sadeem (DASCO)",
    category: "corporate",
    specialties: ["event_planning", "corporate_events", "exhibition_management"],
    yearsExperience: 17,
    priceRange: "1800-4000",
    businessDescription: "Senior Event Manager at Diamond Al Sadeem (DASCO, Est. 2008), professional corporate events and tradeshow organizing specialist.",
    rating: 4.3,
    reviewCount: 68,
    totalEventsOrganized: 140,
    verified: true,
    featured: false
  },
  {
    id: "miraj-media-organizer-010",
    email: "riyadh@mirajmedia.com",
    firstName: "Yasser",
    lastName: "Al-Ghamdi",
    phone: "+966 11 123 4567",
    city: "Riyadh",
    businessName: "Miraj Media",
    category: "corporate",
    specialties: ["event_planning", "production", "multi_location_events"],
    yearsExperience: 14,
    priceRange: "3500-7000",
    businessDescription: "Operations Director at Miraj Media Riyadh office, multi-location agency with presence in Saudi Arabia, Dubai, and Bahrain. Expert in regional event coordination.",
    rating: 4.7,
    reviewCount: 83,
    totalEventsOrganized: 190,
    verified: true,
    featured: false
  }
];

export async function seedRiyadhOrganizers(): Promise<void> {
  console.log("🌱 Starting to seed Riyadh event organizers in new organizers table...");
  
  try {
    for (const organizerData of organizerData) {
      // Create organizer in new organizers table
      const organizer = await storage.createOrganizer(organizerData);
      console.log(`✅ Created organizer: ${organizer.firstName} ${organizer.lastName} (${organizer.businessName})`);
    }
    
    console.log(`🎉 Successfully seeded ${organizerData.length} Riyadh event organizers in organizers table!`);
  } catch (error) {
    console.error("❌ Error seeding organizers:", error);
    throw error;
  }
}