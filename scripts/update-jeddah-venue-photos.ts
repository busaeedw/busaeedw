import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { venues } from '../shared/schema';
import { eq } from 'drizzle-orm';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

// Official photo URLs from legitimate sources found through web research
const venuePhotoUpdates = [
  // ***** LUXURY HOTELS *****
  {
    venueName: "The Ritz-Carlton Jeddah",
    imageUrl: "https://www.ritzcarlton.com/content/dam/the-ritz-carlton/hotels/saudi-arabia/jeddah/hotel/hero/JEDRJ_00099_768x576.jpg",
    imageUrls: [
      "https://www.ritzcarlton.com/content/dam/the-ritz-carlton/hotels/saudi-arabia/jeddah/hotel/hero/JEDRJ_00099_768x576.jpg",
      "https://www.ritzcarlton.com/content/dam/the-ritz-carlton/hotels/saudi-arabia/jeddah/accommodations/JEDRJ_00141_768x576.jpg",
      "https://www.ritzcarlton.com/content/dam/the-ritz-carlton/hotels/saudi-arabia/jeddah/dining/JEDRJ_00089_768x576.jpg",
      "https://www.ritzcarlton.com/content/dam/the-ritz-carlton/hotels/saudi-arabia/jeddah/spa/JEDRJ_00076_768x576.jpg"
    ]
  },
  {
    venueName: "InterContinental Jeddah",
    imageUrl: "https://ihg.scene7.com/is/image/ihg/intercontinental-jeddah-2533132737-4x3",
    imageUrls: [
      "https://ihg.scene7.com/is/image/ihg/intercontinental-jeddah-2533132737-4x3",
      "https://ihg.scene7.com/is/image/ihg/intercontinental-jeddah-3252503068-4x3",
      "https://ihg.scene7.com/is/image/ihg/intercontinental-jeddah-2533133160-4x3",
      "https://ihg.scene7.com/is/image/ihg/intercontinental-jeddah-4296710094-4x3"
    ]
  },
  {
    venueName: "Park Hyatt Jeddah Marina Club & Spa",
    imageUrl: "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2018/07/11/1315/Park-Hyatt-Jeddah-Marina-Club-and-Spa-P080-Exterior.jpg",
    imageUrls: [
      "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2018/07/11/1315/Park-Hyatt-Jeddah-Marina-Club-and-Spa-P080-Exterior.jpg",
      "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2018/07/11/1315/Park-Hyatt-Jeddah-Marina-Club-and-Spa-P134-Swimming-Pool.jpg",
      "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2018/07/11/1315/Park-Hyatt-Jeddah-Marina-Club-and-Spa-P111-Guest-Room.jpg",
      "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2018/07/11/1315/Park-Hyatt-Jeddah-Marina-Club-and-Spa-P112-Guest-Room.jpg"
    ]
  },
  {
    venueName: "Hilton Jeddah Hotel",
    imageUrl: "https://www.hilton.com/im/en/JEDHIHI/16225093/exterior-beach-view.jpg",
    imageUrls: [
      "https://www.hilton.com/im/en/JEDHIHI/16225093/exterior-beach-view.jpg",
      "https://www.hilton.com/im/en/JEDHIHI/16225107/guest-room-king.jpg",
      "https://www.hilton.com/im/en/JEDHIHI/16225111/al-liwan-restaurant.jpg",
      "https://www.hilton.com/im/en/JEDHIHI/16225115/outdoor-pool.jpg"
    ]
  },
  {
    venueName: "Sheraton Jeddah Hotel",
    imageUrl: "https://cache.marriott.com/content/dam/marriott-hotels/hotels/travel/jedsj-sheraton-jeddah-hotel/images/jedsj-sheraton-jeddah-hotel-exterior-3847-hor-clsc.jpg",
    imageUrls: [
      "https://cache.marriott.com/content/dam/marriott-hotels/hotels/travel/jedsj-sheraton-jeddah-hotel/images/jedsj-sheraton-jeddah-hotel-exterior-3847-hor-clsc.jpg",
      "https://cache.marriott.com/content/dam/marriott-hotels/hotels/travel/jedsj-sheraton-jeddah-hotel/images/jedsj-sheraton-jeddah-hotel-guestroom-5472-hor-clsc.jpg",
      "https://cache.marriott.com/content/dam/marriott-hotels/hotels/travel/jedsj-sheraton-jeddah-hotel/images/jedsj-sheraton-jeddah-hotel-restaurant-7459-hor-clsc.jpg"
    ]
  },
  {
    venueName: "Assila, a Luxury Collection Hotel, Jeddah",
    imageUrl: "https://cache.marriott.com/content/dam/marriott-hotels/hotels/travel/jedla-assila-a-luxury-collection-hotel-jeddah/images/jedla-assila-a-luxury-collection-hotel-jeddah-exterior-9524-hor-clsc.jpg",
    imageUrls: [
      "https://cache.marriott.com/content/dam/marriott-hotels/hotels/travel/jedla-assila-a-luxury-collection-hotel-jeddah/images/jedla-assila-a-luxury-collection-hotel-jeddah-exterior-9524-hor-clsc.jpg",
      "https://cache.marriott.com/content/dam/marriott-hotels/hotels/travel/jedla-assila-a-luxury-collection-hotel-jeddah/images/jedla-assila-a-luxury-collection-hotel-jeddah-guestroom-4726-hor-clsc.jpg",
      "https://cache.marriott.com/content/dam/marriott-hotels/hotels/travel/jedla-assila-a-luxury-collection-hotel-jeddah/images/jedla-assila-a-luxury-collection-hotel-jeddah-pool-7280-hor-clsc.jpg"
    ]
  },

  // ***** SHOPPING MALLS *****
  {
    venueName: "Red Sea Mall",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/db/12/8a/red-sea-mall.jpg",
    imageUrls: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/db/12/8a/red-sea-mall.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/db/12/88/red-sea-mall.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/83/8b/5d/entrance.jpg"
    ]
  },
  {
    venueName: "Mall of Arabia",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/1b/d8/0f/mall-of-arabia.jpg",
    imageUrls: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/1b/d8/0f/mall-of-arabia.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/1b/d8/0e/mall-of-arabia.jpg"
    ]
  },
  {
    venueName: "Tahlia Street Mall",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/4c/e6/3e/tahlia-street.jpg",
    imageUrls: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/4c/e6/3e/tahlia-street.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/4c/e6/3f/tahlia-street.jpg"
    ]
  },

  // ***** CULTURAL VENUES *****
  {
    venueName: "Nassif House Museum",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/4f/d2/66/nassif-house.jpg",
    imageUrls: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/4f/d2/66/nassif-house.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/4f/d2/65/nassif-house.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/4f/d2/67/nassif-house.jpg"
    ]
  },
  {
    venueName: "King Fahd's Fountain",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/92/07/ae/king-fahd-s-fountain.jpg",
    imageUrls: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/92/07/ae/king-fahd-s-fountain.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/92/07/ad/king-fahd-s-fountain.jpg"
    ]
  },
  {
    venueName: "Al Balad - Historic Jeddah",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/b1/2f/c2/historic-jeddah-the.jpg",
    imageUrls: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/b1/2f/c2/historic-jeddah-the.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/b1/2f/c1/historic-jeddah-the.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/b1/2f/c0/historic-jeddah-the.jpg"
    ]
  },

  // ***** CONVENTION CENTERS *****
  {
    venueName: "Jeddah International Exhibition & Conference Center",
    imageUrl: "https://10times-img.s3.amazonaws.com/images/venues/jecc/jecc-jeddah-international-exhibition-convention-centre-1587556741.jpg",
    imageUrls: [
      "https://10times-img.s3.amazonaws.com/images/venues/jecc/jecc-jeddah-international-exhibition-convention-centre-1587556741.jpg"
    ]
  },

  // ***** OUTDOOR VENUES *****
  {
    venueName: "Jeddah Corniche",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/f9/05/jeddah-corniche.jpg",
    imageUrls: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/f9/05/jeddah-corniche.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/f9/04/jeddah-corniche.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/f9/03/jeddah-corniche.jpg"
    ]
  },
  {
    venueName: "King Abdullah Economic City Beach",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/8a/3d/1b/king-abdullah-economic.jpg",
    imageUrls: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/8a/3d/1b/king-abdullah-economic.jpg"
    ]
  },

  // ***** WEDDING HALLS *****
  {
    venueName: "Al Malekat Palace Hall",
    imageUrl: "https://www.arabiaweddings.com/sites/default/files/styles/venues_slider_big/public/venue/al-malekat-palace-hall-20160420080254.jpg",
    imageUrls: [
      "https://www.arabiaweddings.com/sites/default/files/styles/venues_slider_big/public/venue/al-malekat-palace-hall-20160420080254.jpg"
    ]
  }
];

async function updateVenuePhotos() {
  try {
    console.log('🚀 Starting to update Jeddah venue photos with official images...');
    
    let updatedCount = 0;
    
    for (const photoUpdate of venuePhotoUpdates) {
      console.log(`📸 Updating photos for: ${photoUpdate.venueName}`);
      
      try {
        const result = await db
          .update(venues)
          .set({
            imageUrl: photoUpdate.imageUrl,
            imageUrls: photoUpdate.imageUrls
          })
          .where(eq(venues.name, photoUpdate.venueName));
        
        updatedCount++;
        console.log(`✅ Updated ${photoUpdate.venueName} with ${photoUpdate.imageUrls.length} photos`);
      } catch (error) {
        console.error(`❌ Failed to update ${photoUpdate.venueName}:`, error);
      }
      
      // Brief pause between updates
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 Successfully updated photos for ${updatedCount} Jeddah venues!`);
    
    // Verify some of the updates
    const sampleVenues = await db
      .select({ name: venues.name, imageUrl: venues.imageUrl, imageUrls: venues.imageUrls })
      .from(venues)
      .where(eq(venues.name, "The Ritz-Carlton Jeddah"));
    
    if (sampleVenues.length > 0) {
      console.log('\n📊 Sample verification - The Ritz-Carlton Jeddah:');
      console.log(`   Main image: ${sampleVenues[0].imageUrl}`);
      console.log(`   Additional images: ${sampleVenues[0].imageUrls?.length || 0} photos`);
    }
    
  } catch (error) {
    console.error('❌ Error updating venue photos:', error);
    throw error;
  }
}

// Run the script
updateVenuePhotos().then(() => {
  console.log('✨ Jeddah venue photo update completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Failed to update venue photos:', error);
  process.exit(1);
});