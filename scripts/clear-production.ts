#!/usr/bin/env tsx
import { db } from "../server/db";
import { users, organizers, events, venues, serviceProviders, eventRegistrations, messages, reviews, serviceBookings, passwordResetTokens } from "../shared/schema";

/**
 * Clear all production data completely
 */

async function clearProductionData() {
  console.log("🗑️  Clearing all production data...");
  
  try {
    // Clear in reverse dependency order to avoid foreign key conflicts
    console.log("Deleting password reset tokens...");
    await db.delete(passwordResetTokens);
    
    console.log("Deleting service bookings...");
    await db.delete(serviceBookings);
    
    console.log("Deleting reviews...");
    await db.delete(reviews);
    
    console.log("Deleting messages...");
    await db.delete(messages);
    
    console.log("Deleting event registrations...");
    await db.delete(eventRegistrations);
    
    console.log("Deleting events...");
    await db.delete(events);
    
    console.log("Deleting organizers...");
    await db.delete(organizers);
    
    console.log("Deleting service providers...");
    await db.delete(serviceProviders);
    
    console.log("Deleting venues...");
    await db.delete(venues);
    
    console.log("Deleting users...");
    await db.delete(users);
    
    console.log("✅ All production data cleared successfully!");
    
  } catch (error) {
    console.error("❌ Clear failed:", error);
    throw error;
  }
}

clearProductionData().catch(console.error);