#!/usr/bin/env tsx
/**
 * Copy Users Table from Development to Production Database
 * This script copies all user data from development to production database
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Development database connection
const devDatabaseUrl = process.env.DATABASE_URL;
if (!devDatabaseUrl) {
  throw new Error("DATABASE_URL must be set for development database");
}

// Production database connection (use TARGET_DATABASE_URL if provided)
const prodDatabaseUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;
if (!prodDatabaseUrl) {
  throw new Error("TARGET_DATABASE_URL must be set for production database");
}

const devPool = new Pool({ connectionString: devDatabaseUrl });
const devDb = drizzle({ client: devPool, schema });

const prodPool = new Pool({ connectionString: prodDatabaseUrl });
const prodDb = drizzle({ client: prodPool, schema });

async function copyUsersToProduction() {
  console.log("🚀 Starting Users Table Copy to Production");
  console.log(`📊 Source (Dev): ${devDatabaseUrl?.substring(0, 50)}...`);
  console.log(`🎯 Target (Prod): ${prodDatabaseUrl?.substring(0, 50)}...`);
  
  if (process.env.TARGET_DATABASE_URL) {
    console.log(`✅ Using TARGET_DATABASE_URL for production database`);
  } else {
    console.log(`⚠️  No TARGET_DATABASE_URL provided, using same database (dev/prod are same)`);
  }
  console.log("");

  try {
    // Step 1: Export all users from development database
    console.log("📤 Exporting users from development database...");
    const users = await devDb.select().from(schema.users);
    console.log(`📊 Found ${users.length} users in development database`);
    
    if (users.length === 0) {
      console.log("⚠️  No users found in development database");
      return;
    }

    // Step 2: Clear existing users in production database
    console.log("🗑️  Clearing existing users in production database...");
    await prodDb.delete(schema.users);
    console.log("✅ Production users table cleared");

    // Step 3: Insert all users into production database
    console.log("📥 Inserting users into production database...");
    
    // Insert users in batches to handle any size efficiently
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await prodDb.insert(schema.users).values(batch);
      insertedCount += batch.length;
      console.log(`  ✓ Inserted ${insertedCount}/${users.length} users`);
    }

    // Step 4: Verify the copy was successful
    console.log("🔍 Verifying production database...");
    const prodUsers = await prodDb.select().from(schema.users);
    console.log(`📊 Production database now has ${prodUsers.length} users`);

    // Verify test user exists
    const testUser = await prodDb.select().from(schema.users).where(eq(schema.users.username, 'wbusaeedv'));
    if (testUser.length > 0) {
      console.log(`✅ Test user confirmed: ${testUser[0].username} (${testUser[0].email})`);
    } else {
      console.log(`⚠️  Test user 'wbusaeedv' not found in production`);
    }

    console.log("");
    console.log("🎉 USERS TABLE COPY COMPLETED SUCCESSFULLY!");
    console.log(`📊 Copied ${users.length} users from development to production`);
    
  } catch (error) {
    console.error("❌ USERS TABLE COPY FAILED:", error);
    throw error;
  } finally {
    await devPool.end();
    await prodPool.end();
  }
}

// Execute the copy operation
copyUsersToProduction()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });