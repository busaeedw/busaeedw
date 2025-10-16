
import { db } from "./db";
import { users, organizers, events, venues, serviceProviders, eventRegistrations, messages, reviews, serviceBookings, passwordResetTokens, sponsors } from "../shared/schema";
import fs from "fs/promises";

/**
 * Helper function to convert timestamps from strings to Date objects
 */
function convertTimestamps(record: any): any {
  if (!record || typeof record !== 'object') return record;
  
  const converted = { ...record };
  const timestampFields = [
    'createdAt', 'updatedAt', 'startDate', 'endDate', 
    'expiresAt', 'registeredAt', 'created_at', 'updated_at', 
    'start_date', 'end_date', 'expires_at', 'registered_at'
  ];
  
  for (const field of timestampFields) {
    if (converted[field] && typeof converted[field] === 'string') {
      converted[field] = new Date(converted[field]);
    }
  }
  return converted;
}

/**
 * Import production data from the deployed production-data.json file
 * This function runs INSIDE the production environment
 */
export async function importProductionDataFromFile() {
  console.log("🚀 Starting production data import...");
  console.log("📍 Running in environment:", process.env.NODE_ENV || 'development');

  try {
    // Read production-data.json from deployed code
    const dataFile = await fs.readFile("./production-data.json", "utf8");
    const productionData = JSON.parse(dataFile);

    console.log("📊 Data Summary:");
    console.log(`  • Users: ${productionData.tables.users?.length || 0}`);
    console.log(`  • Venues: ${productionData.tables.venues?.length || 0}`);
    console.log(`  • Organizers: ${productionData.tables.organizers?.length || 0}`);
    console.log(`  • Service Providers: ${productionData.tables.serviceProviders?.length || 0}`);
    console.log(`  • Events: ${productionData.tables.events?.length || 0}`);

    // Clear existing production data in reverse dependency order
    console.log("🗑️  Clearing existing production data...");
    await db.delete(passwordResetTokens);
    await db.delete(serviceBookings);
    await db.delete(reviews);
    await db.delete(messages);
    await db.delete(eventRegistrations);
    await db.delete(events);
    await db.delete(organizers);
    await db.delete(serviceProviders);
    await db.delete(venues);
    await db.delete(users);
    console.log("✅ Production data cleared");

    const imported = {
      users: 0,
      venues: 0,
      organizers: 0,
      serviceProviders: 0,
      events: 0,
      eventRegistrations: 0,
      messages: 0,
      reviews: 0,
      serviceBookings: 0,
      passwordResetTokens: 0
    };

    // Import in dependency order
    console.log("📥 Importing data to production database...");

    // 1. Users (base table)
    if (productionData.tables.users?.length > 0) {
      console.log(`  Importing ${productionData.tables.users.length} users...`);
      const usersData = productionData.tables.users.map(convertTimestamps);
      await db.insert(users).values(usersData);
      imported.users = productionData.tables.users.length;
    }

    // 2. Venues (independent)
    if (productionData.tables.venues?.length > 0) {
      console.log(`  Importing ${productionData.tables.venues.length} venues...`);
      const venuesData = productionData.tables.venues.map(convertTimestamps);
      await db.insert(venues).values(venuesData);
      imported.venues = productionData.tables.venues.length;
    }

    // 3. Organizers (references users)
    if (productionData.tables.organizers?.length > 0) {
      console.log(`  Importing ${productionData.tables.organizers.length} organizers...`);
      const organizersData = productionData.tables.organizers.map(convertTimestamps);
      await db.insert(organizers).values(organizersData);
      imported.organizers = productionData.tables.organizers.length;
    }

    // 4. Service Providers (references users)
    if (productionData.tables.serviceProviders?.length > 0) {
      console.log(`  Importing ${productionData.tables.serviceProviders.length} service providers...`);
      const providersData = productionData.tables.serviceProviders.map(convertTimestamps);
      await db.insert(serviceProviders).values(providersData);
      imported.serviceProviders = productionData.tables.serviceProviders.length;
    }

    // 5. Events (references organizers and venues)
    if (productionData.tables.events?.length > 0) {
      console.log(`  Importing ${productionData.tables.events.length} events...`);
      const eventsData = productionData.tables.events.map(convertTimestamps);
      await db.insert(events).values(eventsData);
      imported.events = productionData.tables.events.length;
    }

    // 6. Event Registrations (references users and events)
    if (productionData.tables.eventRegistrations?.length > 0) {
      console.log(`  Importing ${productionData.tables.eventRegistrations.length} event registrations...`);
      const registrationsData = productionData.tables.eventRegistrations.map(convertTimestamps);
      await db.insert(eventRegistrations).values(registrationsData);
      imported.eventRegistrations = productionData.tables.eventRegistrations.length;
    }

    // 7. Messages (references users)
    if (productionData.tables.messages?.length > 0) {
      console.log(`  Importing ${productionData.tables.messages.length} messages...`);
      const messagesData = productionData.tables.messages.map(convertTimestamps);
      await db.insert(messages).values(messagesData);
      imported.messages = productionData.tables.messages.length;
    }

    // 8. Reviews (references users and events)
    if (productionData.tables.reviews?.length > 0) {
      console.log(`  Importing ${productionData.tables.reviews.length} reviews...`);
      const reviewsData = productionData.tables.reviews.map(convertTimestamps);
      await db.insert(reviews).values(reviewsData);
      imported.reviews = productionData.tables.reviews.length;
    }

    // 9. Service Bookings (references users and service providers)
    if (productionData.tables.serviceBookings?.length > 0) {
      console.log(`  Importing ${productionData.tables.serviceBookings.length} service bookings...`);
      const bookingsData = productionData.tables.serviceBookings.map(convertTimestamps);
      await db.insert(serviceBookings).values(bookingsData);
      imported.serviceBookings = productionData.tables.serviceBookings.length;
    }

    // 10. Password Reset Tokens (references users)  
    if (productionData.tables.passwordResetTokens?.length > 0) {
      console.log(`  Importing ${productionData.tables.passwordResetTokens.length} password tokens...`);
      const tokensData = productionData.tables.passwordResetTokens.map(convertTimestamps);
      await db.insert(passwordResetTokens).values(tokensData);
      imported.passwordResetTokens = productionData.tables.passwordResetTokens.length;
    }

    console.log("\n✅ Production data import completed successfully!");
    console.log("📊 Import results:");
    console.log(`  • Users: ${imported.users}`);
    console.log(`  • Venues: ${imported.venues}`);
    console.log(`  • Organizers: ${imported.organizers}`);
    console.log(`  • Service Providers: ${imported.serviceProviders}`);
    console.log(`  • Events: ${imported.events}`);
    console.log(`  • Event Registrations: ${imported.eventRegistrations}`);
    console.log(`  • Messages: ${imported.messages}`);
    console.log(`  • Reviews: ${imported.reviews}`);
    console.log(`  • Service Bookings: ${imported.serviceBookings}`);
    console.log(`  • Password Reset Tokens: ${imported.passwordResetTokens}`);

    return imported;

  } catch (error) {
    console.error("❌ Production import failed:", error);
    throw error;
  }
}
