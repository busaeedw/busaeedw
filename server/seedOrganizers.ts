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