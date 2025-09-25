import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { venues } from '../shared/schema';
import { eq, and, or, like } from 'drizzle-orm';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

// Replace placeholder URLs with working image URLs
const imageUpdates = [
  // Hotels - use professional hotel images
  {
    venueTypes: ['hotel'],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop&auto=format'
  },
  // Wedding halls - use elegant ballroom/event images
  {
    venueTypes: ['wedding_hall'],
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29c7c8de7?w=800&h=400&fit=crop&auto=format'
  },
  // Shopping malls - use modern mall interior images
  {
    venueTypes: ['mall'],
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=400&fit=crop&auto=format'
  },
  // Cultural centers - use museum/gallery images
  {
    venueTypes: ['cultural_center'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&auto=format'
  },
  // Convention centers - use conference/business images
  {
    venueTypes: ['convention_center'],
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop&auto=format'
  },
  // Community centers - use community/public space images
  {
    venueTypes: ['community_center'],
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format'
  },
  // Outdoor venues - use outdoor event space images
  {
    venueTypes: ['outdoor'],
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=400&fit=crop&auto=format'
  },
  // Sports centers - use sports facility images
  {
    venueTypes: ['sports_center'],
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&auto=format'
  },
  // Entertainment venues - use entertainment/gaming images
  {
    venueTypes: ['entertainment_venue'],
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&auto=format'
  }
];

async function fixPlaceholderImages() {
  try {
    console.log('🚀 Starting to fix Jeddah venue placeholder images...');
    
    let totalUpdated = 0;
    
    // First, fix all venues with example.com URLs or null images by venue type
    for (const update of imageUpdates) {
      for (const venueType of update.venueTypes) {
        console.log(`🖼️  Updating ${venueType} venues in Jeddah...`);
        
        // Update venues with placeholder URLs or null images
        const result = await pool.query(`
          UPDATE venues 
          SET image_url = $1 
          WHERE city ILIKE 'jeddah' 
          AND venue_type = $2 
          AND (image_url IS NULL OR image_url LIKE 'https://example.com%')
        `, [update.imageUrl, venueType]);
        
        const updatedCount = result.rowCount || 0;
        totalUpdated += updatedCount;
        console.log(`✅ Updated ${updatedCount} ${venueType} venues`);
      }
    }
    
    // Handle venues without specific types or with null venue_type
    console.log('🔧 Updating venues without specific types...');
    const fallbackResult = await pool.query(`
      UPDATE venues 
      SET image_url = $1 
      WHERE city ILIKE 'jeddah' 
      AND (venue_type IS NULL OR venue_type NOT IN ('hotel', 'wedding_hall', 'mall', 'cultural_center', 'convention_center', 'community_center', 'outdoor', 'sports_center', 'entertainment_venue'))
      AND (image_url IS NULL OR image_url LIKE 'https://example.com%')
    `, ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=400&fit=crop&auto=format']);
    
    const fallbackCount = fallbackResult.rowCount || 0;
    totalUpdated += fallbackCount;
    console.log(`✅ Updated ${fallbackCount} venues without specific types`);
    
    console.log(`🎉 Successfully updated ${totalUpdated} Jeddah venue images!`);
    
    // Verify the updates
    const verificationResult = await pool.query(`
      SELECT COUNT(*) as total, 
             COUNT(CASE WHEN image_url IS NOT NULL AND image_url NOT LIKE 'https://example.com%' THEN 1 END) as with_real_images
      FROM venues 
      WHERE city ILIKE 'jeddah'
    `);
    
    const stats = verificationResult.rows[0];
    console.log(`📊 Jeddah venues: ${stats.with_real_images}/${stats.total} now have real images`);
    
  } catch (error) {
    console.error('❌ Error fixing placeholder images:', error);
    throw error;
  }
}

// Run the script
fixPlaceholderImages().then(() => {
  console.log('✨ Jeddah venue image fix completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Failed to fix venue images:', error);
  process.exit(1);
});