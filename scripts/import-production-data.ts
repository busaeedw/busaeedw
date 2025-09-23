#!/usr/bin/env tsx
import { db } from "../server/db";
import { users, organizers, events, venues, serviceProviders, eventRegistrations, messages, reviews, serviceBookings, passwordResetTokens } from "../shared/schema";
import fs from "fs/promises";
import { eq } from "drizzle-orm";

/**
 * Import development data to production database
 * This script reads the exported data and seeds the production database
 */

interface ProductionData {
  exportedAt: string;
  tables: {
    users: any[];
    organizers: any[];
    events: any[];
    venues: any[];
    serviceProviders: any[];
    eventRegistrations: any[];
    messages: any[];
    reviews: any[];
    serviceBookings: any[];
    passwordResetTokens: any[];
  };
  summary: {
    totalUsers: number;
    totalOrganizers: number;
    totalEvents: number;
    totalVenues: number;
    totalServiceProviders: number;
    totalRegistrations: number;
  };
}

async function clearExistingData() {
  console.log("🗑️  Clearing existing production data...");
  
  // Clear in reverse dependency order to avoid foreign key conflicts
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
  
  console.log("✅ Existing data cleared");
}

async function importProductionData() {
  console.log("🚀 Starting production data import...\n");

  try {
    // Read exported data
    const dataFile = await fs.readFile("./production-data.json", "utf8");
    const productionData: ProductionData = JSON.parse(dataFile);

    console.log(`📁 Importing data exported at: ${productionData.exportedAt}`);
    console.log(`📊 Expected import summary:`);
    console.log(`  • Users: ${productionData.summary.totalUsers}`);
    console.log(`  • Organizers: ${productionData.summary.totalOrganizers}`);
    console.log(`  • Events: ${productionData.summary.totalEvents}`);
    console.log(`  • Venues: ${productionData.summary.totalVenues}`);
    console.log(`  • Service Providers: ${productionData.summary.totalServiceProviders}`);
    console.log(`  • Registrations: ${productionData.summary.totalRegistrations}\n`);

    // Ask for confirmation in production
    if (process.env.NODE_ENV === 'production') {
      console.log("⚠️  This will completely replace all production data!");
      console.log("⚠️  Make sure you have a backup before proceeding.");
    }

    // Clear existing data first
    await clearExistingData();

    console.log("📥 Importing new data...");

    // Import in dependency order
    let imported = {
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

    // 1. Users (base table)
    if (productionData.tables.users.length > 0) {
      await db.insert(users).values(productionData.tables.users);
      imported.users = productionData.tables.users.length;
    }

    // 2. Venues (independent)
    if (productionData.tables.venues.length > 0) {
      await db.insert(venues).values(productionData.tables.venues);
      imported.venues = productionData.tables.venues.length;
    }

    // 3. Organizers (references users)
    if (productionData.tables.organizers.length > 0) {
      await db.insert(organizers).values(productionData.tables.organizers);
      imported.organizers = productionData.tables.organizers.length;
    }

    // 4. Service Providers (references users)
    if (productionData.tables.serviceProviders.length > 0) {
      await db.insert(serviceProviders).values(productionData.tables.serviceProviders);
      imported.serviceProviders = productionData.tables.serviceProviders.length;
    }

    // 5. Events (references organizers and venues)
    if (productionData.tables.events.length > 0) {
      await db.insert(events).values(productionData.tables.events);
      imported.events = productionData.tables.events.length;
    }

    // 6. Event Registrations (references users and events)
    if (productionData.tables.eventRegistrations.length > 0) {
      await db.insert(eventRegistrations).values(productionData.tables.eventRegistrations);
      imported.eventRegistrations = productionData.tables.eventRegistrations.length;
    }

    // 7. Messages (references users)
    if (productionData.tables.messages.length > 0) {
      await db.insert(messages).values(productionData.tables.messages);
      imported.messages = productionData.tables.messages.length;
    }

    // 8. Reviews (references users and events)
    if (productionData.tables.reviews.length > 0) {
      await db.insert(reviews).values(productionData.tables.reviews);
      imported.reviews = productionData.tables.reviews.length;
    }

    // 9. Service Bookings (references users and service providers)
    if (productionData.tables.serviceBookings.length > 0) {
      await db.insert(serviceBookings).values(productionData.tables.serviceBookings);
      imported.serviceBookings = productionData.tables.serviceBookings.length;
    }

    // 10. Password Reset Tokens (references users)
    if (productionData.tables.passwordResetTokens.length > 0) {
      await db.insert(passwordResetTokens).values(productionData.tables.passwordResetTokens);
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
    console.error("❌ Import failed:", error);
    throw error;
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importProductionData().catch(console.error);
}

export { importProductionData };