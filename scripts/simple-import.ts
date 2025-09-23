#!/usr/bin/env tsx
import { db } from "../server/db";
import { users, organizers, events, venues, serviceProviders, eventRegistrations, messages, reviews, serviceBookings, passwordResetTokens } from "../shared/schema";
import fs from "fs/promises";

/**
 * Simple import with comprehensive timestamp handling
 */

function convertAllTimestamps(record: any): any {
  if (!record || typeof record !== 'object') return record;
  
  const converted = { ...record };
  
  // List of all possible timestamp field names in our schema
  const timestampFields = [
    'createdAt', 'updatedAt', 'startDate', 'endDate', 'expiresAt', 'registeredAt',
    'created_at', 'updated_at', 'start_date', 'end_date', 'expires_at', 'registered_at'
  ];
  
  for (const field of timestampFields) {
    if (converted[field] && typeof converted[field] === 'string') {
      converted[field] = new Date(converted[field]);
    }
  }
  
  return converted;
}

async function simpleImport() {
  console.log("🚀 Starting simple production import...");

  try {
    // Read exported data
    const dataFile = await fs.readFile("./production-data.json", "utf8");
    const productionData = JSON.parse(dataFile);

    // Clear existing data
    console.log("🗑️ Clearing production database...");
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

    // Import each table with comprehensive timestamp conversion
    let results = { users: 0, venues: 0, organizers: 0, serviceProviders: 0, events: 0, registrations: 0 };

    // 1. Users
    if (productionData.tables.users?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.users.length} users...`);
      const usersData = productionData.tables.users.map(convertAllTimestamps);
      await db.insert(users).values(usersData);
      results.users = productionData.tables.users.length;
    }

    // 2. Venues
    if (productionData.tables.venues?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.venues.length} venues...`);
      const venuesData = productionData.tables.venues.map(convertAllTimestamps);
      await db.insert(venues).values(venuesData);
      results.venues = productionData.tables.venues.length;
    }

    // 3. Organizers
    if (productionData.tables.organizers?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.organizers.length} organizers...`);
      const organizersData = productionData.tables.organizers.map(convertAllTimestamps);
      await db.insert(organizers).values(organizersData);
      results.organizers = productionData.tables.organizers.length;
    }

    // 4. Service Providers
    if (productionData.tables.serviceProviders?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.serviceProviders.length} service providers...`);
      const providersData = productionData.tables.serviceProviders.map(convertAllTimestamps);
      await db.insert(serviceProviders).values(providersData);
      results.serviceProviders = productionData.tables.serviceProviders.length;
    }

    // 5. Events
    if (productionData.tables.events?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.events.length} events...`);
      const eventsData = productionData.tables.events.map(convertAllTimestamps);
      await db.insert(events).values(eventsData);
      results.events = productionData.tables.events.length;
    }

    // 6. Event Registrations
    if (productionData.tables.eventRegistrations?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.eventRegistrations.length} registrations...`);
      const registrationsData = productionData.tables.eventRegistrations.map(convertAllTimestamps);
      await db.insert(eventRegistrations).values(registrationsData);
      results.registrations = productionData.tables.eventRegistrations.length;
    }

    // Skip empty tables
    if (productionData.tables.messages?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.messages.length} messages...`);
      const messagesData = productionData.tables.messages.map(convertAllTimestamps);
      await db.insert(messages).values(messagesData);
    }

    if (productionData.tables.reviews?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.reviews.length} reviews...`);
      const reviewsData = productionData.tables.reviews.map(convertAllTimestamps);
      await db.insert(reviews).values(reviewsData);
    }

    if (productionData.tables.serviceBookings?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.serviceBookings.length} bookings...`);
      const bookingsData = productionData.tables.serviceBookings.map(convertAllTimestamps);
      await db.insert(serviceBookings).values(bookingsData);
    }

    if (productionData.tables.passwordResetTokens?.length > 0) {
      console.log(`📥 Importing ${productionData.tables.passwordResetTokens.length} tokens...`);
      const tokensData = productionData.tables.passwordResetTokens.map(convertAllTimestamps);
      await db.insert(passwordResetTokens).values(tokensData);
    }

    console.log("\n🎉 Production import completed successfully!");
    console.log("📊 Import Results:");
    console.log(`  ✅ Users: ${results.users}`);
    console.log(`  ✅ Venues: ${results.venues}`);
    console.log(`  ✅ Organizers: ${results.organizers}`);
    console.log(`  ✅ Service Providers: ${results.serviceProviders}`);
    console.log(`  ✅ Events: ${results.events}`);
    console.log(`  ✅ Event Registrations: ${results.registrations}`);

    console.log("\n🌐 Your production app is now ready!");
    console.log("🔗 Login at: https://event-hub.replit.app");
    console.log("👤 Username: wbusaeedv");
    console.log("🔑 Password: Omar1000");

  } catch (error) {
    console.error("❌ Simple import failed:", error);
    throw error;
  }
}

simpleImport().catch(console.error);