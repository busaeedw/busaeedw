#!/usr/bin/env tsx
import { db } from "../server/db";
import { users, organizers, events, venues, serviceProviders, eventRegistrations, messages, reviews, serviceBookings, passwordResetTokens } from "../shared/schema";
import fs from "fs/promises";

/**
 * Export all development database data for production deployment
 * This script creates JSON files containing all table data
 */

async function exportProductionData() {
  console.log("🚀 Starting production data export...\n");

  try {
    // Export all tables
    const rawTablesData = {
      users: await db.select().from(users),
      organizers: await db.select().from(organizers), 
      events: await db.select().from(events),
      venues: await db.select().from(venues),
      serviceProviders: await db.select().from(serviceProviders),
      eventRegistrations: await db.select().from(eventRegistrations),
      messages: await db.select().from(messages),
      reviews: await db.select().from(reviews),
      serviceBookings: await db.select().from(serviceBookings),
    };

    // SECURITY: Strip sensitive credential fields to prevent exposure
    const tablesData = {
      ...rawTablesData,
      users: rawTablesData.users.map(({ password, ...user }) => ({ ...user, password: null })),
    };

    // Log export summary
    console.log("📊 Export Summary:");
    console.log(`  • Users: ${tablesData.users.length}`);
    console.log(`  • Organizers: ${tablesData.organizers.length}`);
    console.log(`  • Events: ${tablesData.events.length}`);
    console.log(`  • Venues: ${tablesData.venues.length}`);
    console.log(`  • Service Providers: ${tablesData.serviceProviders.length}`);
    console.log(`  • Event Registrations: ${tablesData.eventRegistrations.length}`);
    console.log(`  • Messages: ${tablesData.messages.length}`);
    console.log(`  • Reviews: ${tablesData.reviews.length}`);
    console.log(`  • Service Bookings: ${tablesData.serviceBookings.length}`);
    console.log("⚠️  Password fields excluded for security");

    // Write to production data file
    const exportData = {
      exportedAt: new Date().toISOString(),
      tables: tablesData,
      summary: {
        totalUsers: tablesData.users.length,
        totalOrganizers: tablesData.organizers.length,
        totalEvents: tablesData.events.length,
        totalVenues: tablesData.venues.length,
        totalServiceProviders: tablesData.serviceProviders.length,
        totalRegistrations: tablesData.eventRegistrations.length
      }
    };

    await fs.writeFile(
      "./production-data.json", 
      JSON.stringify(exportData, null, 2)
    );

    console.log("\n✅ Production data exported successfully!");
    console.log("📁 File: ./scripts/production-data.json");
    console.log(`📏 Size: ${JSON.stringify(exportData).length} characters`);

    return exportData;

  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

// Run export if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportProductionData().catch(console.error);
}

export { exportProductionData };