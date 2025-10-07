import { events, eventRegistrations } from '../shared/schema';
import { db } from './db';
import { nanoid } from 'nanoid';

// Real event data using available organizers and venues
const sampleEvents = [
  {
    organizerId: "luxuryksa-organizer-001",
    title: "Saudi Vision 2030 Business Summit",
    titleAr: "قمة رؤية السعودية 2030 للأعمال",
    description: "Join leading business executives, entrepreneurs, and government officials as we explore opportunities in Saudi Arabia's Vision 2030 transformation. This premium summit will cover key sectors including NEOM, tourism, entertainment, and renewable energy initiatives.",
    descriptionAr: "انضم إلى كبار المسؤولين التنفيذيين ورجال الأعمال والمسؤولين الحكوميين لاستكشاف الفرص في تحول رؤية السعودية 2030. ستغطي هذه القمة القطاعات الرئيسية بما في ذلك نيوم والسياحة والترفيه ومبادرات الطاقة المتجددة.",
    category: "business",
    startDate: new Date("2025-01-15T09:00:00.000Z"),
    endDate: new Date("2025-01-15T17:00:00.000Z"),
    location: "King Abdullah Financial District",
    city: "riyadh",
    venue: "Riyadh International Convention & Exhibition Center",
    price: 1200.00,
    maxAttendees: 500,
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
    status: "published"
  },
  {
    organizerId: "eventfull-organizer-002",
    title: "Riyadh Tech Innovation Conference 2025",
    titleAr: "مؤتمر الرياض للابتكار التقني 2025",
    description: "Discover the latest in artificial intelligence, fintech, and smart city solutions. Network with tech leaders, startups, and investors shaping Saudi Arabia's digital transformation.",
    descriptionAr: "اكتشف أحدث التطورات في الذكاء الاصطناعي والتكنولوجيا المالية وحلول المدن الذكية. تواصل مع قادة التكنولوجيا والشركات الناشئة والمستثمرين الذين يشكلون التحول الرقمي في السعودية.",
    category: "technology",
    startDate: new Date("2025-02-20T08:30:00.000Z"),
    endDate: new Date("2025-02-21T18:00:00.000Z"),
    location: "Olaya District",
    city: "riyadh",
    venue: "Four Seasons Hotel Riyadh - Kingdom Ballroom",
    price: 850.00,
    maxAttendees: 300,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    status: "published"
  },
  {
    organizerId: "aplus-events-organizer-003",
    title: "Arabian Luxury Wedding Expo",
    titleAr: "معرض الزفاف العربي الفاخر",
    description: "The Kingdom's most prestigious wedding exhibition featuring luxury venues, designers, and service providers. Perfect for couples planning their dream wedding with authentic Saudi traditions and modern elegance.",
    descriptionAr: "المعرض الأكثر تميزاً للزفاف في المملكة يضم أفخم القاعات والمصممين ومقدمي الخدمات. مثالي للأزواج الذين يخططون لحفل زفاف أحلامهم بأصالة التقاليد السعودية والأناقة العصرية.",
    category: "cultural",
    startDate: new Date("2025-03-08T10:00:00.000Z"),
    endDate: new Date("2025-03-10T20:00:00.000Z"),
    location: "Diplomatic Quarter",
    city: "riyadh",
    venue: "Al Faisaliah Hotel - Prince Sultan's Grand Hall",
    price: 250.00,
    maxAttendees: 800,
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    status: "published"
  },
  {
    organizerId: "blink-experience-organizer-004",
    title: "Saudi National Day Celebration Gala",
    titleAr: "حفل اليوم الوطني السعودي",
    description: "Celebrate the Kingdom's heritage with an evening of traditional performances, cultural exhibitions, and fireworks. Honoring Saudi Arabia's rich history and bright future.",
    descriptionAr: "احتفل بتراث المملكة مع أمسية من العروض التقليدية والمعارض الثقافية والألعاب النارية. تكريماً لتاريخ المملكة العربية السعودية الغني ومستقبلها المشرق.",
    category: "cultural",
    startDate: new Date("2025-09-23T19:00:00.000Z"),
    endDate: new Date("2025-09-23T23:30:00.000Z"),
    location: "King Fahd Road",
    city: "riyadh",
    venue: "Raffles Hotel Riyadh - Rafal Ballroom",
    price: 400.00,
    maxAttendees: 600,
    imageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800",
    status: "published"
  },
  {
    organizerId: "hafray-organizer-005",
    title: "Middle East Healthcare Innovation Summit",
    titleAr: "قمة الابتكار الصحي في الشرق الأوسط",
    description: "Advancing healthcare technology and medical research in the GCC region. Featuring leading physicians, researchers, and healthcare technology companies.",
    descriptionAr: "تطوير تكنولوجيا الرعاية الصحية والبحث الطبي في منطقة الخليج. يضم كبار الأطباء والباحثين وشركات تكنولوجيا الرعاية الصحية.",
    category: "business",
    startDate: new Date("2025-04-12T08:00:00.000Z"),
    endDate: new Date("2025-04-13T17:00:00.000Z"),
    location: "Diplomatic Quarter",
    city: "riyadh",
    venue: "Hilton Riyadh Hotel & Residences",
    price: 950.00,
    maxAttendees: 400,
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800",
    status: "published"
  },
  {
    organizerId: "amkenah-organizer-006",
    title: "Saudi Youth Leadership Forum",
    titleAr: "منتدى القيادة الشبابية السعودية",
    description: "Empowering the next generation of Saudi leaders through workshops, mentorship, and networking opportunities. Aligned with Vision 2030's focus on youth development.",
    descriptionAr: "تمكين قادة الغد من خلال برامج القيادة والإرشاد والتطوير المهني المصممة للشباب السعودي الطموح. متماشياً مع تركيز رؤية 2030 على تنمية الشباب.",
    category: "business",
    startDate: new Date("2025-05-25T09:00:00.000Z"),
    endDate: new Date("2025-05-25T16:00:00.000Z"),
    location: "King Saud University District",
    city: "riyadh",
    venue: "Nayyara Banqueting & Conference Centre",
    price: 150.00,
    maxAttendees: 350,
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    status: "published"
  },
  {
    organizerId: "eventana-organizer-007",
    title: "Riyadh International Food Festival",
    titleAr: "مهرجان الرياض الدولي للطعام",
    description: "Taste the world in Riyadh! Featuring authentic cuisines from over 30 countries, cooking demonstrations by celebrity chefs, and traditional Saudi dishes.",
    descriptionAr: "تذوق العالم في الرياض! يضم مأكولات أصيلة من أكثر من 30 دولة وعروض طهي من طهاة مشاهير وأطباق سعودية تقليدية.",
    category: "entertainment",
    startDate: new Date("2025-01-28T12:00:00.000Z"),
    endDate: new Date("2025-02-01T22:00:00.000Z"),
    location: "King Abdullah Park",
    city: "riyadh",
    venue: "King Fahd Culture Centre",
    price: 75.00,
    maxAttendees: 1200,
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    status: "published"
  },
  {
    organizerId: "time-entertainment-organizer-008",
    title: "Arabian Music & Arts Festival",
    titleAr: "مهرجان الموسيقى والفنون العربية",
    description: "Celebrate Middle Eastern culture through music, poetry, and visual arts. Features traditional oud performances, contemporary Saudi artists, and cultural workshops.",
    descriptionAr: "احتفال بالموسيقى والفنون العربية التقليدية والمعاصرة مع فنانين من جميع أنحاء العالم العربي. يضم عروض عود تقليدية وفنانين سعوديين معاصرين وورش عمل ثقافية.",
    category: "cultural",
    startDate: new Date("2025-03-15T18:00:00.000Z"),
    endDate: new Date("2025-03-17T23:00:00.000Z"),
    location: "Historic Diriyah",
    city: "riyadh",
    venue: "JW Marriott Hotel Riyadh",
    price: 180.00,
    maxAttendees: 700,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    status: "published"
  },
  {
    organizerId: "dasco-organizer-009",
    title: "Global Trade & Investment Conference",
    titleAr: "مؤتمر التجارة والاستثمار العالمي",
    description: "Connect with international investors and explore trade opportunities in Saudi Arabia. Focus on manufacturing, logistics, and cross-border commerce.",
    descriptionAr: "تواصل مع المستثمرين الدوليين واستكشف فرص التجارة في المملكة العربية السعودية. التركيز على التصنيع والخدمات اللوجستية والتجارة عبر الحدود.",
    category: "business",
    startDate: new Date("2025-02-05T08:30:00.000Z"),
    endDate: new Date("2025-02-06T17:30:00.000Z"),
    location: "King Abdullah Financial District",
    city: "riyadh",
    venue: "Mövenpick Hotel Riyadh - Grand Ballroom",
    price: 1100.00,
    maxAttendees: 450,
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
    status: "published"
  },
  {
    organizerId: "eventfull-organizer-002",
    title: "Riyadh Startup Pitch Competition",
    titleAr: "مسابقة الرياض للشركات الناشئة",
    description: "Watch promising Saudi startups compete for funding and mentorship opportunities. Featuring venture capitalists, angel investors, and successful entrepreneurs.",
    descriptionAr: "اعرض شركتك الناشئة أمام كبار المستثمرين وخبراء الصناعة. تنافس للحصول على التمويل والإرشاد وفرص النمو.",
    category: "technology",
    startDate: new Date("2025-06-10T14:00:00.000Z"),
    endDate: new Date("2025-06-10T20:00:00.000Z"),
    location: "King Abdullah Financial District",
    city: "riyadh",
    venue: "Radisson Blu Hotel & Convention Center",
    price: 200.00,
    maxAttendees: 250,
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    status: "published"
  },
  {
    organizerId: "luxuryksa-organizer-001",
    title: "Saudi Women's Leadership Summit",
    titleAr: "قمة القيادة النسائية السعودية",
    description: "Celebrating women's achievements in business, technology, and society. Inspiring stories, networking opportunities, and professional development workshops.",
    descriptionAr: "احتفالاً بإنجازات المرأة في الأعمال والتكنولوجيا والمجتمع. قصص ملهمة وفرص للتواصل وورش عمل للتطوير المهني.",
    category: "business",
    startDate: new Date("2025-03-08T09:00:00.000Z"),
    endDate: new Date("2025-03-08T17:00:00.000Z"),
    location: "Diplomatic Quarter",
    city: "riyadh",
    venue: "Four Seasons Hotel Riyadh - Kingdom Ballroom",
    price: 300.00,
    maxAttendees: 400,
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
    status: "published"
  },
  {
    organizerId: "hafray-organizer-005",
    title: "Riyadh Gaming & Esports Championship",
    titleAr: "بطولة الرياض للألعاب والرياضات الإلكترونية",
    description: "The Kingdom's premier gaming tournament featuring popular games, professional teams, and substantial prize pools. Part of Saudi Arabia's growing esports ecosystem.",
    descriptionAr: "البطولة الأولى للألعاب في المملكة تضم ألعاب شهيرة وفرق محترفة وجوائز كبيرة. جزء من نظام الرياضات الإلكترونية المتنامي في السعودية.",
    category: "entertainment",
    startDate: new Date("2025-07-15T10:00:00.000Z"),
    endDate: new Date("2025-07-17T22:00:00.000Z"),
    location: "Riyadh Front",
    city: "riyadh",
    venue: "Riyadh International Convention & Exhibition Center",
    price: 120.00,
    maxAttendees: 900,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    status: "published"
  },
  {
    organizerId: "blink-experience-organizer-004",
    title: "Saudi Green Energy Expo",
    titleAr: "معرض الطاقة الخضراء السعودية",
    description: "Showcasing renewable energy solutions, solar technology, and sustainability initiatives. Supporting Saudi Arabia's commitment to environmental leadership.",
    descriptionAr: "عرض حلول الطاقة المتجددة وتقنيات الطاقة الشمسية ومبادرات الاستدامة. دعماً لالتزام المملكة بالقيادة البيئية.",
    category: "technology",
    startDate: new Date("2025-04-22T09:00:00.000Z"),
    endDate: new Date("2025-04-24T18:00:00.000Z"),
    location: "King Abdullah Financial District",
    city: "riyadh",
    venue: "Al Faisaliah Hotel - Prince Sultan's Grand Hall",
    price: 400.00,
    maxAttendees: 600,
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800",
    status: "published"
  },
  {
    organizerId: "amkenah-organizer-006",
    title: "Traditional Saudi Handicrafts Exhibition",
    titleAr: "معرض الحرف اليدوية السعودية التقليدية",
    description: "Discover authentic Saudi craftsmanship including traditional textiles, pottery, jewelry, and woodwork. Meet master craftsmen and learn ancient techniques.",
    descriptionAr: "اكتشف الحرف اليدوية السعودية الأصيلة بما في ذلك المنسوجات التقليدية والفخار والمجوهرات والنجارة. قابل الحرفيين المهرة وتعلم التقنيات القديمة.",
    category: "cultural",
    startDate: new Date("2025-05-01T10:00:00.000Z"),
    endDate: new Date("2025-05-03T19:00:00.000Z"),
    location: "Old Riyadh",
    city: "riyadh",
    venue: "King Fahd Culture Centre",
    price: 50.00,
    maxAttendees: 800,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    status: "published"
  },
  {
    organizerId: "eventana-organizer-007",
    title: "Riyadh Corporate Wellness Conference",
    titleAr: "مؤتمر الرياض للصحة المؤسسية",
    description: "Promoting workplace wellness, mental health awareness, and employee wellbeing strategies. Features wellness experts, corporate leaders, and health professionals.",
    descriptionAr: "تعزيز صحة الموظفين ورفاهيتهم في مكان العمل. تعلم من الخبراء حول الصحة النفسية واللياقة البدنية وثقافة العافية.",
    category: "business",
    startDate: new Date("2025-06-18T08:00:00.000Z"),
    endDate: new Date("2025-06-18T16:00:00.000Z"),
    location: "King Abdullah Financial District",
    city: "riyadh",
    venue: "Hilton Riyadh Hotel & Residences",
    price: 250.00,
    maxAttendees: 300,
    imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800",
    status: "published"
  }
];

// Attendee IDs to use for event registrations
const attendeeIds = [
  "46547418", // Current user
  "CuZOpQ",
  "ZiqhnU", 
  "KjbfIC"
];

export async function seedSampleEvents() {
  console.log('Starting to seed 15 sample events...');
  
  try {
    const createdEvents = [];
    
    for (const eventData of sampleEvents) {
      console.log(`Creating event: ${eventData.title}...`);
      
      // Insert event
      const insertedEvent = await db.insert(events).values({
        id: nanoid(),
        organizerId: eventData.organizerId,
        title: eventData.title,
        titleAr: eventData.titleAr,
        description: eventData.description,
        descriptionAr: eventData.descriptionAr,
        category: eventData.category,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        city: eventData.city,
        venue: eventData.venue,
        price: eventData.price.toString(),
        currency: "SAR",
        maxAttendees: eventData.maxAttendees,
        imageUrl: eventData.imageUrl,
        status: eventData.status,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: events.id });

      const eventId = insertedEvent[0].id;
      createdEvents.push({ id: eventId, title: eventData.title });
      
      console.log(`✓ Created event: ${eventData.title} (${eventId})`);
    }

    console.log('\nCreating event registrations...');
    
    // Create varied registrations for events
    for (let i = 0; i < createdEvents.length; i++) {
      const event = createdEvents[i];
      
      // Determine how many attendees to register (1-4 per event, varied)
      const registrationCount = Math.floor(Math.random() * 4) + 1;
      const shuffledAttendees = [...attendeeIds].sort(() => Math.random() - 0.5);
      
      for (let j = 0; j < Math.min(registrationCount, shuffledAttendees.length); j++) {
        const attendeeId = shuffledAttendees[j];
        
        try {
          await db.insert(eventRegistrations).values({
            id: nanoid(),
            eventId: event.id,
            attendeeId: attendeeId,
            status: "registered",
            ticketCode: `TICKET-${nanoid(8).toUpperCase()}`,
            registeredAt: new Date(),
          });
          
          console.log(`  ✓ Registered attendee ${attendeeId} for ${event.title}`);
        } catch (error) {
          // Skip if already registered (avoid duplicates)
          console.log(`  - Attendee ${attendeeId} already registered for ${event.title}`);
        }
      }
    }

    console.log(`\n✅ Successfully seeded ${sampleEvents.length} events with registrations!`);
    return { eventsCreated: createdEvents.length, message: "Sample events and registrations created successfully" };
    
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  }
}
