import { storage } from "./storage";
import type { UpsertUser, InsertServiceProvider } from "@shared/schema";

// Real event organizers from Riyadh, Saudi Arabia
const organizerData = [
  {
    user: {
      id: "luxuryksa-organizer-001",
      email: "info@luxuryksa.com",
      firstName: "Ahmed",
      lastName: "Al-Rashid",
      role: "organizer",
      phone: "+966 11 234 5678",
      city: "Riyadh",
      bio: "CEO of LuxuryKSA, leading event management company specializing in concept development, creative direction, and brand management across the Kingdom."
    } as UpsertUser,
    serviceProvider: {
      businessName: "LuxuryKSA",
      category: "entertainment",
      services: ["Event Management", "Creative Direction", "Brand Management", "Concept Development", "Corporate Events"],
      priceRange: "Premium (50,000+ SAR)",
      portfolio: [],
      verified: true,
      rating: "4.8"
    }
  },
  {
    user: {
      id: "eventfull-organizer-002", 
      email: "contact@eventfull.sa",
      firstName: "Sarah",
      lastName: "Al-Mansouri",
      role: "organizer",
      phone: "+966 11 345 6789",
      city: "Riyadh",
      bio: "Founder of Eventfull, 6+ years experience with 350+ successful projects. Specializes in tech-driven brand experiences and corporate events."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Eventfull",
      category: "planning",
      services: ["Corporate Events", "Brand Experiences", "Tech-Driven Solutions", "Logistics Coordination", "Digital Integration"],
      priceRange: "Mid-Premium (25,000-75,000 SAR)",
      portfolio: [],
      verified: true,
      rating: "4.7"
    }
  },
  {
    user: {
      id: "aplus-events-organizer-003",
      email: "info@aplus.events",
      firstName: "Mohammed",
      lastName: "Al-Otaibi",
      role: "organizer", 
      phone: "+966 11 456 7890",
      city: "Riyadh",
      bio: "Managing Director of Aplus Events, complete event solutions provider with full media production capabilities. Expert in luxury weddings and corporate celebrations."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Aplus Events",
      category: "entertainment",
      services: ["Complete Event Solutions", "Media Production", "Awards Dinners", "Conferences", "Luxury Weddings", "Exhibitions"],
      priceRange: "Premium (40,000+ SAR)",
      portfolio: [],
      verified: true,
      rating: "4.9"
    }
  },
  {
    user: {
      id: "blink-experience-organizer-004",
      email: "riyadh@blinkexperience.com",
      firstName: "Khalid",
      lastName: "Al-Harbi",
      role: "organizer",
      phone: "+966 11 567 8901", 
      city: "Riyadh",
      bio: "Regional Director of Blink Experience, 21+ years international experience. Managed KSA National Day Fireworks (Guinness World Record 2018) and FEI World Cup Finals 2024."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Blink Experience",
      category: "entertainment",
      services: ["International Event Management", "Large-Scale Productions", "Government Events", "Sports Events", "Cultural Festivals"],
      priceRange: "Premium (100,000+ SAR)",
      portfolio: [],
      verified: true,
      rating: "4.9"
    }
  },
  {
    user: {
      id: "hafray-organizer-005",
      email: "info@hafray.com",
      firstName: "Fatima",
      lastName: "Al-Zahrani",
      role: "organizer",
      phone: "+966 11 678 9012",
      city: "Riyadh", 
      bio: "Senior Event Director at Hafray, top-tier corporate events and exhibitions specialist. Expert in AV production, lighting, and comprehensive event support."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Hafray",
      category: "planning",
      services: ["Corporate Events", "Exhibitions", "AV Production", "Lighting Design", "Video Production", "Branding Solutions"],
      priceRange: "Mid-Premium (30,000-80,000 SAR)",
      portfolio: [],
      verified: true,
      rating: "4.6"
    }
  },
  {
    user: {
      id: "amkenah-organizer-006",
      email: "events@amkenah.com",
      firstName: "Omar",
      lastName: "Al-Dosari",
      role: "organizer",
      phone: "+966 11 789 0123",
      city: "Riyadh",
      bio: "Co-founder of Amkenah Marketing & Events (Est. 2014), 40+ years combined team experience. Aligned with Saudi Vision 2030 initiatives."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Amkenah Marketing & Events", 
      category: "planning",
      services: ["Marketing Communication", "Event Planning", "Vision 2030 Projects", "Government Relations", "Strategic Consulting"],
      priceRange: "Mid-Range (20,000-50,000 SAR)",
      portfolio: [],
      verified: true,
      rating: "4.5"
    }
  },
  {
    user: {
      id: "eventana-organizer-007",
      email: "hello@eventana.net",
      firstName: "Nora",
      lastName: "Al-Quraishi",
      role: "organizer",
      phone: "+966 11 890 1234",
      city: "Riyadh",
      bio: "Creative Director at Eventana (Est. 2007), integrated event management and brand activation specialist with innovative approach to experiential marketing."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Eventana",
      category: "planning",
      services: ["Integrated Event Management", "Brand Activation", "Experiential Marketing", "Creative Development", "Full-Service Planning"],
      priceRange: "Mid-Premium (25,000-60,000 SAR)",
      portfolio: [],
      verified: true,
      rating: "4.6"
    }
  },
  {
    user: {
      id: "time-entertainment-organizer-008",
      email: "riyadh@timeentertainment.sa",
      firstName: "Abdullah",
      lastName: "Al-Malki", 
      role: "organizer",
      phone: "+966 11 901 2345",
      city: "Riyadh",
      bio: "Regional Manager at Time Entertainment, established presence with international outlook. Specializes in entertainment management and cultural events."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Time Entertainment",
      category: "entertainment",
      services: ["Entertainment Management", "Cultural Events", "Artist Booking", "Show Production", "International Coordination"],
      priceRange: "Mid-Range (15,000-45,000 SAR)",
      portfolio: [],
      verified: true,
      rating: "4.4"
    }
  },
  {
    user: {
      id: "dasco-organizer-009",
      email: "events@dasco.sa",
      firstName: "Reem",
      lastName: "Al-Sibai",
      role: "organizer",
      phone: "+966 11 012 3456",
      city: "Riyadh",
      bio: "Senior Event Manager at Diamond Al Sadeem (DASCO, Est. 2008), professional corporate events and tradeshow organizing specialist."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Diamond Al Sadeem (DASCO)",
      category: "planning",
      services: ["Corporate Events", "Tradeshow Organizing", "Professional Services", "Business Conferences", "Networking Events"],
      priceRange: "Mid-Range (18,000-40,000 SAR)",
      portfolio: [],
      verified: true,
      rating: "4.3"
    }
  },
  {
    user: {
      id: "miraj-media-organizer-010",
      email: "riyadh@mirajmedia.com",
      firstName: "Yasser",
      lastName: "Al-Ghamdi",
      role: "organizer",
      phone: "+966 11 123 4567",
      city: "Riyadh",
      bio: "Operations Director at Miraj Media Riyadh office, multi-location agency with presence in Saudi Arabia, Dubai, and Bahrain. Expert in regional event coordination."
    } as UpsertUser,
    serviceProvider: {
      businessName: "Miraj Media",
      category: "planning",
      services: ["Multi-Location Events", "Regional Coordination", "Media Production", "Event Planning", "Cross-Border Logistics"],
      priceRange: "Premium (35,000-70,000 SAR)",
      portfolio: [],
      verified: true,
      rating: "4.7"
    }
  }
];

export async function seedRiyadhOrganizers(): Promise<void> {
  console.log("🌱 Starting to seed Riyadh event organizers...");
  
  try {
    for (const organizer of organizerData) {
      // Create user account
      const user = await storage.upsertUser(organizer.user);
      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${organizer.serviceProvider.businessName})`);
      
      // Create service provider profile
      const serviceProvider = await storage.createServiceProvider({
        ...organizer.serviceProvider,
        userId: user.id
      } as any);
      console.log(`🏢 Created service provider profile for: ${serviceProvider.businessName}`);
    }
    
    console.log("🎉 Successfully seeded all 10 Riyadh event organizers!");
  } catch (error) {
    console.error("❌ Error seeding organizers:", error);
    throw error;
  }
}