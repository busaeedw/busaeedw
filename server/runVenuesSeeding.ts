import { seedVenues } from "./seedVenues";

async function main() {
  try {
    console.log("🚀 Starting venues seeding process...");
    await seedVenues();
    console.log("✅ Venues seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during venues seeding:", error);
    process.exit(1);
  }
}

main();