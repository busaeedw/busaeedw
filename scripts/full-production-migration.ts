#!/usr/bin/env tsx
/**
 * Complete Production Database Migration
 * This script performs a full database migration from development to production
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import fs from "fs/promises";

neonConfig.webSocketConstructor = ws;

// Connect to database using current environment
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

interface BackupData {
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
}

async function fullProductionMigration() {
  console.log("🚀 Starting FULL Production Database Migration");
  console.log(`🔗 Database: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
  console.log("");

  try {
    // Step 1: Read the exported production data
    console.log("📖 Reading exported development data...");
    const dataFile = await fs.readFile("./production-data.json", "utf8");
    const exportData = JSON.parse(dataFile);
    const backupData: BackupData = exportData.tables;

    console.log(`📊 Data Summary:`);
    console.log(`  • Users: ${backupData.users?.length || 0}`);
    console.log(`  • Organizers: ${backupData.organizers?.length || 0}`);
    console.log(`  • Events: ${backupData.events?.length || 0}`);
    console.log(`  • Venues: ${backupData.venues?.length || 0}`);
    console.log(`  • Service Providers: ${backupData.serviceProviders?.length || 0}`);
    console.log(`  • Event Registrations: ${backupData.eventRegistrations?.length || 0}`);
    console.log("");

    // Step 2: Completely clear ALL tables
    console.log("🗑️  CLEARING ALL PRODUCTION TABLES...");
    
    // Use DELETE to ensure complete table clearing
    await db.delete(schema.passwordResetTokens);
    await db.delete(schema.serviceBookings); 
    await db.delete(schema.reviews);
    await db.delete(schema.messages);
    await db.delete(schema.eventRegistrations);
    await db.delete(schema.events);
    await db.delete(schema.organizers);
    await db.delete(schema.serviceProviders);
    await db.delete(schema.venues);
    await db.delete(schema.users);
    
    console.log("✅ All production tables cleared");

    // Helper function to convert timestamps
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

    // Step 3: Import ALL tables in dependency order
    console.log("📥 IMPORTING ALL DATA TO PRODUCTION...");
    
    let imported = {
      users: 0, venues: 0, organizers: 0, serviceProviders: 0, 
      events: 0, registrations: 0, messages: 0, reviews: 0, 
      bookings: 0, tokens: 0
    };

    // Import Users
    if (backupData.users?.length > 0) {
      console.log(`📥 Importing ${backupData.users.length} users...`);
      const usersData = backupData.users.map(convertTimestamps);
      await db.insert(schema.users).values(usersData);
      imported.users = backupData.users.length;
    }

    // Import Venues
    if (backupData.venues?.length > 0) {
      console.log(`📥 Importing ${backupData.venues.length} venues...`);
      const venuesData = backupData.venues.map(convertTimestamps);
      await db.insert(schema.venues).values(venuesData);
      imported.venues = backupData.venues.length;
    }

    // Import Organizers
    if (backupData.organizers?.length > 0) {
      console.log(`📥 Importing ${backupData.organizers.length} organizers...`);
      const organizersData = backupData.organizers.map(convertTimestamps);
      await db.insert(schema.organizers).values(organizersData);
      imported.organizers = backupData.organizers.length;
    }

    // Import Service Providers
    if (backupData.serviceProviders?.length > 0) {
      console.log(`📥 Importing ${backupData.serviceProviders.length} service providers...`);
      const providersData = backupData.serviceProviders.map(convertTimestamps);
      await db.insert(schema.serviceProviders).values(providersData);
      imported.serviceProviders = backupData.serviceProviders.length;
    }

    // Import Events
    if (backupData.events?.length > 0) {
      console.log(`📥 Importing ${backupData.events.length} events...`);
      const eventsData = backupData.events.map(convertTimestamps);
      await db.insert(schema.events).values(eventsData);
      imported.events = backupData.events.length;
    }

    // Import Event Registrations
    if (backupData.eventRegistrations?.length > 0) {
      console.log(`📥 Importing ${backupData.eventRegistrations.length} event registrations...`);
      const registrationsData = backupData.eventRegistrations.map(convertTimestamps);
      await db.insert(schema.eventRegistrations).values(registrationsData);
      imported.registrations = backupData.eventRegistrations.length;
    }

    // Import Messages
    if (backupData.messages?.length > 0) {
      console.log(`📥 Importing ${backupData.messages.length} messages...`);
      const messagesData = backupData.messages.map(convertTimestamps);
      await db.insert(schema.messages).values(messagesData);
      imported.messages = backupData.messages.length;
    }

    // Import Reviews
    if (backupData.reviews?.length > 0) {
      console.log(`📥 Importing ${backupData.reviews.length} reviews...`);
      const reviewsData = backupData.reviews.map(convertTimestamps);
      await db.insert(schema.reviews).values(reviewsData);
      imported.reviews = backupData.reviews.length;
    }

    // Import Service Bookings
    if (backupData.serviceBookings?.length > 0) {
      console.log(`📥 Importing ${backupData.serviceBookings.length} service bookings...`);
      const bookingsData = backupData.serviceBookings.map(convertTimestamps);
      await db.insert(schema.serviceBookings).values(bookingsData);
      imported.bookings = backupData.serviceBookings.length;
    }

    // Import Password Reset Tokens
    if (backupData.passwordResetTokens?.length > 0) {
      console.log(`📥 Importing ${backupData.passwordResetTokens.length} password tokens...`);
      const tokensData = backupData.passwordResetTokens.map(convertTimestamps);
      await db.insert(schema.passwordResetTokens).values(tokensData);
      imported.tokens = backupData.passwordResetTokens.length;
    }

    console.log("\n🎉 COMPLETE PRODUCTION MIGRATION SUCCESSFUL!");
    console.log("📊 Final Import Results:");
    console.log(`  ✅ Users: ${imported.users}`);
    console.log(`  ✅ Venues: ${imported.venues}`);
    console.log(`  ✅ Organizers: ${imported.organizers}`);
    console.log(`  ✅ Service Providers: ${imported.serviceProviders}`);
    console.log(`  ✅ Events: ${imported.events}`);
    console.log(`  ✅ Event Registrations: ${imported.registrations}`);
    console.log(`  ✅ Messages: ${imported.messages}`);
    console.log(`  ✅ Reviews: ${imported.reviews}`);
    console.log(`  ✅ Service Bookings: ${imported.bookings}`);
    console.log(`  ✅ Password Tokens: ${imported.tokens}`);

    console.log("\n🌐 PRODUCTION DATABASE READY!");
    console.log("🔗 Login URL: https://event-hub.replit.app");
    console.log("👤 Test User: wbusaeedv");
    console.log("🔑 Password: Omar1000");

    // Verify the user exists
    console.log("\n🔍 Verifying test user exists...");
    const testUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'wbusaeedv')
    });
    
    if (testUser) {
      console.log(`✅ Test user confirmed: ${testUser.username} (${testUser.email})`);
    } else {
      console.log("❌ Test user NOT found in database!");
    }

    await pool.end();
    return imported;

  } catch (error) {
    console.error("❌ FULL PRODUCTION MIGRATION FAILED:", error);
    await pool.end();
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fullProductionMigration().catch(console.error);
}

export { fullProductionMigration };