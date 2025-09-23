#!/usr/bin/env tsx
import { db } from "../server/db";
import { users } from "../shared/schema";
import fs from "fs/promises";

/**
 * Debug script to test importing one table at a time
 */

async function debugImport() {
  console.log("🔍 Starting debug import...");

  try {
    // Read exported data
    const dataFile = await fs.readFile("./production-data.json", "utf8");
    const productionData = JSON.parse(dataFile);

    console.log("📊 Testing users import first...");
    
    // Test just users first
    const testUser = productionData.tables.users[0];
    console.log("Sample user data:", testUser);
    
    // Parse timestamps manually for this user
    const userWithDates = {
      ...testUser,
      createdAt: testUser.createdAt ? new Date(testUser.createdAt) : undefined,
      updatedAt: testUser.updatedAt ? new Date(testUser.updatedAt) : undefined,
    };
    
    console.log("Parsed user data:", userWithDates);
    
    // Try to insert just one user
    await db.insert(users).values([userWithDates]);
    
    console.log("✅ Single user import successful!");

  } catch (error) {
    console.error("❌ Debug import failed:", error);
  }
}

debugImport().catch(console.error);