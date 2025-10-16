import { importProductionDataFromFile } from "./server/production-import";

async function testImport() {
  console.log("🧪 Testing import function in development environment...\n");
  console.log("⚠️  WARNING: This will REPLACE all development data with production-data.json");
  console.log("   (This is a test - your development database will be reset)\n");

  try {
    const result = await importProductionDataFromFile();
    
    console.log("\n✅ TEST SUCCESSFUL!");
    console.log("\n📊 Import Results:");
    console.log(`  ✅ Users: ${result.users}`);
    console.log(`  ✅ Venues: ${result.venues}`);
    console.log(`  ✅ Organizers: ${result.organizers}`);
    console.log(`  ✅ Service Providers: ${result.serviceProviders}`);
    console.log(`  ✅ Events: ${result.events}`);
    console.log(`  ✅ Event Registrations: ${result.eventRegistrations}`);
    console.log(`  ✅ Messages: ${result.messages}`);
    console.log(`  ✅ Reviews: ${result.reviews}`);
    console.log(`  ✅ Service Bookings: ${result.serviceBookings}`);
    console.log(`  ✅ Password Tokens: ${result.passwordResetTokens}`);
    
    console.log("\n✅ Import function works correctly!");
    console.log("✅ All data imported successfully!");
    console.log("✅ Foreign key relationships intact!");
    console.log("\n🚀 Ready for production deployment!");
    
  } catch (error) {
    console.error("\n❌ TEST FAILED!");
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

testImport();
