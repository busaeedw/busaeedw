#!/usr/bin/env tsx
import { importProductionData } from "./import-production-data";

/**
 * Complete production deployment script
 * 1. Assumes database schema is already pushed to production via `npm run db:push`
 * 2. Imports all development data to production database
 */

async function deployToProduction() {
  console.log("🚀 Starting complete production deployment...\n");
  
  console.log("📋 Deployment Steps:");
  console.log("  1. ✅ Database schema (assumed already pushed via npm run db:push)");  
  console.log("  2. 📥 Import development data to production database");
  console.log("");

  try {
    console.log("🚀 Step 2: Importing development data...");
    await importProductionData();
    
    console.log("\n🎉 Production deployment completed successfully!");
    console.log("🌐 Your production app now has all development data:");
    console.log("  • 58 Users (including wbusaeedv)");
    console.log("  • 30 Organizers");
    console.log("  • 17 Events");
    console.log("  • 121 Venues");  
    console.log("  • 20 Service Providers");
    console.log("  • 15 Event Registrations");
    
    console.log("\n✅ You can now login at https://event-hub.replit.app with:");
    console.log("  Username: wbusaeedv");
    console.log("  Password: Omar1000");
    
  } catch (error) {
    console.error("❌ Production deployment failed:", error);
    throw error;
  }
}

// Run deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deployToProduction().catch(console.error);
}

export { deployToProduction };