import {
  users,
  events,
  eventRegistrations,
  serviceProviders,
  reviews,
  messages,
  serviceBookings,
  venues,
  organizers,
  passwordResetTokens,
  sponsors,
  eventSponsors,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type InsertEventRegistration,
  type ServiceProvider,
  type InsertServiceProvider,
  type Review,
  type InsertReview,
  type Message,
  type InsertMessage,
  type ServiceBooking,
  type InsertServiceBooking,
  type Venue,
  type InsertVenue,
  type Organizer,
  type InsertOrganizer,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type Sponsor,
  type InsertSponsor,
  type EventSponsor,
  type InsertEventSponsor,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(filters?: {
    category?: string;
    city?: string;
    search?: string;
    organizerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // Event registration operations
  registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration>;
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  getUserRegistrations(userId: string): Promise<EventRegistration[]>;
  cancelRegistration(eventId: string, userId: string): Promise<void>;
  
  // Service provider operations
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  getServiceProvider(id: string): Promise<ServiceProvider | undefined>;
  getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined>;
  getServiceProviders(filters?: {
    category?: string;
    city?: string;
    verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ServiceProvider[]>;
  updateServiceProvider(id: string, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviews(targetType: string, targetId: string): Promise<Review[]>;
  
  // Message operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Service booking operations
  createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking>;
  getServiceBookings(filters?: {
    eventId?: string;
    serviceProviderId?: string;
    organizerId?: string;
  }): Promise<ServiceBooking[]>;
  updateServiceBookingStatus(id: string, status: string): Promise<ServiceBooking>;
  
  // Venue operations
  createVenue(venue: InsertVenue): Promise<Venue>;
  getVenue(id: string): Promise<Venue | undefined>;
  getVenues(filters?: {
    city?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Venue[]>;
  updateVenue(id: string, updates: Partial<InsertVenue>): Promise<Venue>;
  deleteVenue(id: string): Promise<void>;
  
  // Organizer operations
  createOrganizer(organizer: InsertOrganizer): Promise<Organizer>;
  getOrganizer(id: string): Promise<Organizer | undefined>;
  getOrganizerByEmail(email: string): Promise<Organizer | undefined>;
  getOrganizers(filters?: {
    category?: string;
    city?: string;
    search?: string;
    verified?: boolean;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Organizer[]>;
  updateOrganizer(id: string, updates: Partial<InsertOrganizer>): Promise<Organizer>;
  deleteOrganizer(id: string): Promise<void>;
  
  // Sponsor operations
  createSponsor(sponsor: InsertSponsor): Promise<Sponsor>;
  getSponsor(id: string): Promise<Sponsor | undefined>;
  getSponsorByUserId(userId: string): Promise<Sponsor | undefined>;
  getSponsors(filters?: {
    city?: string;
    search?: string;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Sponsor[]>;
  updateSponsor(id: string, updates: Partial<InsertSponsor>): Promise<Sponsor>;
  deleteSponsor(id: string): Promise<void>;
  
  // Event-Sponsor association operations
  attachSponsorToEvent(eventSponsor: InsertEventSponsor): Promise<EventSponsor>;
  getEventSponsors(eventId: string): Promise<(EventSponsor & { sponsor: Sponsor })[]>;
  detachSponsorFromEvent(eventId: string, sponsorId: string): Promise<void>;
  updateEventSponsorTier(eventId: string, sponsorId: string, tier: string, displayOrder?: number): Promise<EventSponsor>;
  
  // Analytics
  getEventStats(): Promise<{ totalEvents: number; totalAttendees: number; totalProviders: number }>;
  
  // Password reset operations
  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  getValidResetToken(tokenHash: string): Promise<{ id: string; userId: string } | undefined>;
  markResetTokenUsed(id: string): Promise<void>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  invalidateUserSessions(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Password hashing helper methods
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async comparePasswords(plaintext: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hashed);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Hash password if provided
      const processedData = { ...userData };
      if (processedData.password) {
        processedData.password = await this.hashPassword(processedData.password);
      }

      const [user] = await db
        .insert(users)
        .values(processedData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...processedData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error: any) {
      // Handle uniqueness constraint violations
      if (error.code === '23505') {
        if (error.constraint === 'users_email_unique') {
          const existingUser = await this.getUserByEmail(userData.email!);
          if (existingUser) {
            // Only update safe non-identifier fields for OIDC users
            if (!userData.password) {
              const safeUpdates: Partial<UpsertUser> = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImageUrl: userData.profileImageUrl,
                bio: userData.bio,
                phone: userData.phone,
                city: userData.city,
                updatedAt: new Date(),
              };
              
              // Remove undefined values
              Object.keys(safeUpdates).forEach(key => {
                if (safeUpdates[key as keyof typeof safeUpdates] === undefined) {
                  delete safeUpdates[key as keyof typeof safeUpdates];
                }
              });
              
              const [updatedUser] = await db
                .update(users)
                .set(safeUpdates)
                .where(eq(users.email, userData.email!))
                .returning();
              return updatedUser;
            }
            // For password-based registration, don't allow overwriting existing users
            throw new Error('User with this email already exists');
          }
        } else if (error.constraint === 'users_username_unique') {
          throw new Error('Username already exists');
        }
      }
      throw error;
    }
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [createdEvent] = await db.insert(events).values(event).returning();
    return createdEvent;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [result] = await db
      .select({
        event: events,
        organizer: organizers,
      })
      .from(events)
      .leftJoin(organizers, eq(events.organizerId, organizers.id))
      .where(eq(events.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.event,
      organizer: result.organizer || undefined,
    } as any;
  }

  async getEvents(filters?: {
    category?: string;
    city?: string;
    search?: string;
    organizerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    const conditions = [eq(events.status, "published")];

    if (filters?.category) {
      conditions.push(eq(events.category, filters.category));
    }
    if (filters?.city) {
      conditions.push(eq(events.city, filters.city));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(events.title, `%${filters.search}%`),
          ilike(events.description, `%${filters.search}%`)
        )!
      );
    }
    if (filters?.organizerId) {
      conditions.push(eq(events.organizerId, filters.organizerId));
    }

    let query: any = db.select().from(events).where(and(...conditions)).orderBy(desc(events.startDate));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Event registration operations
  async registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration> {
    const ticketCode = randomUUID().substring(0, 8).toUpperCase();
    const [reg] = await db
      .insert(eventRegistrations)
      .values({ ...registration, ticketCode })
      .returning();
    return reg;
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
  }

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.attendeeId, userId));
  }

  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    await db
      .update(eventRegistrations)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.attendeeId, userId)
        )
      );
  }

  // Service provider operations
  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [serviceProvider] = await db.insert(serviceProviders).values(provider).returning();
    return serviceProvider;
  }

  async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider;
  }

  async getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.userId, userId));
    return provider;
  }

  async getServiceProviders(filters?: {
    category?: string;
    city?: string;
    verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ServiceProvider[]> {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(serviceProviders.category, filters.category));
    }
    if (filters?.verified !== undefined) {
      conditions.push(eq(serviceProviders.verified, filters.verified));
    }

    let query: any = db.select().from(serviceProviders);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(serviceProviders.rating));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async updateServiceProvider(id: string, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider> {
    const [provider] = await db
      .update(serviceProviders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceProviders.id, id))
      .returning();
    return provider;
  }

  async deleteServiceProvider(id: string): Promise<void> {
    await db.delete(serviceProviders).where(eq(serviceProviders.id, id));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [createdReview] = await db.insert(reviews).values(review).returning();
    
    // Update rating for service providers
    if (review.targetType === "service_provider") {
      const avgRating = await db
        .select({ avg: sql`AVG(${reviews.rating})`, count: sql`COUNT(*)` })
        .from(reviews)
        .where(
          and(
            eq(reviews.targetType, "service_provider"),
            eq(reviews.targetId, review.targetId)
          )
        );

      if (avgRating[0]) {
        await db
          .update(serviceProviders)
          .set({
            rating: String(avgRating[0].avg),
            reviewCount: Number(avgRating[0].count),
          })
          .where(eq(serviceProviders.id, review.targetId));
      }
    }

    return createdReview;
  }

  async getReviews(targetType: string, targetId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.targetType, targetType), eq(reviews.targetId, targetId)))
      .orderBy(desc(reviews.createdAt));
  }

  // Message operations
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [sentMessage] = await db.insert(messages).values(message).returning();
    return sentMessage;
  }

  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]> {
    // This is a simplified implementation - in production you'd want a more efficient query
    const userMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const conversationMap = new Map<string, Message>();
    
    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, message);
      }
    }

    const conversations = [];
    for (const [otherUserId, lastMessage] of Array.from(conversationMap)) {
      const user = await this.getUser(otherUserId);
      if (user) {
        conversations.push({ user, lastMessage });
      }
    }

    return conversations;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db.update(messages).set({ read: true }).where(eq(messages.id, messageId));
  }

  // Service booking operations
  async createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking> {
    const [createdBooking] = await db.insert(serviceBookings).values(booking).returning();
    return createdBooking;
  }

  async getServiceBookings(filters?: {
    eventId?: string;
    serviceProviderId?: string;
    organizerId?: string;
  }): Promise<ServiceBooking[]> {
    let query = db.select().from(serviceBookings).$dynamic();

    const conditions = [];
    if (filters?.eventId) {
      conditions.push(eq(serviceBookings.eventId, filters.eventId));
    }
    if (filters?.serviceProviderId) {
      conditions.push(eq(serviceBookings.serviceProviderId, filters.serviceProviderId));
    }
    if (filters?.organizerId) {
      conditions.push(eq(serviceBookings.organizerId, filters.organizerId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(serviceBookings.createdAt));
  }

  async updateServiceBookingStatus(id: string, status: string): Promise<ServiceBooking> {
    const [booking] = await db
      .update(serviceBookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(serviceBookings.id, id))
      .returning();
    return booking;
  }

  // Venue operations
  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [createdVenue] = await db.insert(venues).values(venue).returning();
    return createdVenue;
  }

  async getVenue(id: string): Promise<Venue | undefined> {
    const [result] = await db
      .select({
        venue: venues,
        owner: users,
      })
      .from(venues)
      .leftJoin(users, eq(venues.userId, users.id))
      .where(eq(venues.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.venue,
      owner: result.owner || undefined,
    } as any;
  }

  async getVenues(filters?: {
    city?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Venue[]> {
    const conditions = [];

    if (filters?.city) {
      conditions.push(eq(venues.city, filters.city));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(venues.name, `%${filters.search}%`),
          ilike(venues.location, `%${filters.search}%`)
        )!
      );
    }

    let query = db.select().from(venues).$dynamic();
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(venues.name);

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async updateVenue(id: string, updates: Partial<InsertVenue>): Promise<Venue> {
    const [venue] = await db
      .update(venues)
      .set(updates)
      .where(eq(venues.id, id))
      .returning();
    return venue;
  }

  async deleteVenue(id: string): Promise<void> {
    // Check if venue is referenced by any events
    const [referencingEvent] = await db.select({ id: events.id }).from(events).where(eq(events.venueId, id)).limit(1);
    
    if (referencingEvent) {
      throw new Error('Cannot delete venue: it is currently used by one or more events');
    }
    
    await db.delete(venues).where(eq(venues.id, id));
  }

  async getUserVenuesWithStats(userId: string): Promise<any[]> {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01`);
    const yearEnd = new Date(`${currentYear}-12-31T23:59:59`);

    const userVenues = await db
      .select({
        id: venues.id,
        name: venues.name,
        nameAr: venues.nameAr,
        city: venues.city,
        location: venues.location,
        eventCount: sql<number>`count(CASE WHEN ${events.startDate} >= ${yearStart} AND ${events.startDate} <= ${yearEnd} THEN 1 END)`.as('event_count'),
      })
      .from(venues)
      .leftJoin(events, eq(venues.id, events.venueId))
      .where(eq(venues.userId, userId))
      .groupBy(venues.id, venues.name, venues.nameAr, venues.city, venues.location);

    return userVenues;
  }

  // Organizer operations
  async createOrganizer(organizer: InsertOrganizer): Promise<Organizer> {
    const [createdOrganizer] = await db.insert(organizers).values(organizer).returning();
    return createdOrganizer;
  }

  async getOrganizer(id: string): Promise<Organizer | undefined> {
    const [organizer] = await db.select().from(organizers).where(eq(organizers.id, id));
    return organizer;
  }

  async getOrganizerByEmail(email: string): Promise<Organizer | undefined> {
    const [organizer] = await db.select().from(organizers).where(eq(organizers.email, email));
    return organizer;
  }

  async getOrganizers(filters?: {
    category?: string;
    city?: string;
    search?: string;
    verified?: boolean;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Organizer[]> {
    console.log("🔍 getOrganizers called with filters:", filters);
    
    try {
      const conditions = [];

      if (filters?.category) {
        conditions.push(eq(organizers.category, filters.category));
      }
      if (filters?.city) {
        conditions.push(eq(organizers.city, filters.city));
      }
      if (filters?.search) {
        conditions.push(
          or(
            ilike(organizers.firstName, `%${filters.search}%`),
            ilike(organizers.lastName, `%${filters.search}%`),
            ilike(organizers.businessName, `%${filters.search}%`),
            ilike(organizers.email, `%${filters.search}%`)
          )!
        );
      }
      if (filters?.verified === true) {
        conditions.push(eq(organizers.verified, true));
      } else if (filters?.verified === false) {
        conditions.push(eq(organizers.verified, false));
      }
      if (filters?.featured === true) {
        conditions.push(eq(organizers.featured, true));
      } else if (filters?.featured === false) {
        conditions.push(eq(organizers.featured, false));
      }

      console.log("📋 Query conditions count:", conditions.length);

      let query = db.select().from(organizers).$dynamic();
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      query = query.orderBy(desc(organizers.featured), desc(organizers.verified), organizers.businessName);

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      const result = await query;
      console.log("✅ getOrganizers result count:", result.length);
      
      if (result.length > 0) {
        console.log("📄 First organizer sample:", {
          id: result[0].id,
          businessName: result[0].businessName,
          verified: result[0].verified
        });
      }
      
      return result;
    } catch (error) {
      console.error("❌ Error in getOrganizers:", error);
      throw error;
    }
  }

  async updateOrganizer(id: string, updates: Partial<InsertOrganizer>): Promise<Organizer> {
    const [organizer] = await db
      .update(organizers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(organizers.id, id))
      .returning();
    return organizer;
  }

  async deleteOrganizer(id: string): Promise<void> {
    // Check if organizer has any events
    const [referencingEvent] = await db.select({ id: events.id }).from(events).where(eq(events.organizerId, id)).limit(1);
    
    if (referencingEvent) {
      throw new Error('Cannot delete organizer: they have organized events');
    }
    
    await db.delete(organizers).where(eq(organizers.id, id));
  }

  // Analytics
  async getEventStats(): Promise<{ totalEvents: number; totalAttendees: number; totalProviders: number }> {
    const [eventCount] = await db.select({ count: sql`COUNT(*)` }).from(events);
    const [attendeeCount] = await db.select({ count: sql`COUNT(*)` }).from(eventRegistrations);
    const [providerCount] = await db.select({ count: sql`COUNT(*)` }).from(serviceProviders);

    return {
      totalEvents: Number(eventCount.count),
      totalAttendees: Number(attendeeCount.count),
      totalProviders: Number(providerCount.count),
    };
  }

  // Password reset operations
  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });
  }

  async getValidResetToken(tokenHash: string): Promise<{ id: string; userId: string } | undefined> {
    const [token] = await db
      .select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          sql`${passwordResetTokens.expiresAt} > NOW()`, // Token not expired
          sql`${passwordResetTokens.usedAt} IS NULL` // Token not used
        )
      );
    return token;
  }

  async markResetTokenUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    // Note: This implementation depends on session management strategy
    // For express-session with PostgreSQL store, we would need to delete sessions
    // This is a placeholder - actual implementation would depend on session store
    console.log(`Invalidating sessions for user ${userId}`);
  }

  // Sponsor operations
  async createSponsor(sponsorData: InsertSponsor): Promise<Sponsor> {
    const [sponsor] = await db
      .insert(sponsors)
      .values(sponsorData)
      .returning();
    return sponsor;
  }

  async getSponsor(id: string): Promise<Sponsor | undefined> {
    const [sponsor] = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.id, id));
    return sponsor;
  }

  async getSponsorByUserId(userId: string): Promise<Sponsor | undefined> {
    const [sponsor] = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.userId, userId));
    return sponsor;
  }

  async getSponsors(filters?: {
    city?: string;
    search?: string;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Sponsor[]> {
    let query = db.select().from(sponsors);

    const conditions = [];
    if (filters?.city) {
      conditions.push(eq(sponsors.city, filters.city));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(sponsors.name, `%${filters.search}%`),
          ilike(sponsors.nameAr, `%${filters.search}%`),
          ilike(sponsors.description, `%${filters.search}%`)
        )!
      );
    }
    if (filters?.isFeatured !== undefined) {
      conditions.push(eq(sponsors.isFeatured, filters.isFeatured));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)!) as typeof query;
    }

    query = query.orderBy(desc(sponsors.isFeatured), desc(sponsors.createdAt)) as typeof query;

    if (filters?.limit) {
      query = query.limit(filters.limit) as typeof query;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as typeof query;
    }

    return query;
  }

  async updateSponsor(id: string, updates: Partial<InsertSponsor>): Promise<Sponsor> {
    const [sponsor] = await db
      .update(sponsors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sponsors.id, id))
      .returning();
    return sponsor;
  }

  async deleteSponsor(id: string): Promise<void> {
    await db.delete(sponsors).where(eq(sponsors.id, id));
  }

  // Event-Sponsor association operations
  async attachSponsorToEvent(eventSponsorData: InsertEventSponsor): Promise<EventSponsor> {
    const [eventSponsor] = await db
      .insert(eventSponsors)
      .values(eventSponsorData)
      .returning();
    return eventSponsor;
  }

  async getEventSponsors(eventId: string): Promise<(EventSponsor & { sponsor: Sponsor })[]> {
    const results = await db
      .select()
      .from(eventSponsors)
      .innerJoin(sponsors, eq(eventSponsors.sponsorId, sponsors.id))
      .where(eq(eventSponsors.eventId, eventId))
      .orderBy(eventSponsors.displayOrder, desc(eventSponsors.createdAt));

    return results.map(row => ({
      ...row.event_sponsors,
      sponsor: row.sponsors,
    }));
  }

  async detachSponsorFromEvent(eventId: string, sponsorId: string): Promise<void> {
    await db
      .delete(eventSponsors)
      .where(
        and(
          eq(eventSponsors.eventId, eventId),
          eq(eventSponsors.sponsorId, sponsorId)
        )
      );
  }

  async updateEventSponsorTier(
    eventId: string,
    sponsorId: string,
    tier: string,
    displayOrder?: number
  ): Promise<EventSponsor> {
    const updates: Partial<InsertEventSponsor> = { tier };
    if (displayOrder !== undefined) {
      updates.displayOrder = displayOrder;
    }

    const [eventSponsor] = await db
      .update(eventSponsors)
      .set(updates)
      .where(
        and(
          eq(eventSponsors.eventId, eventId),
          eq(eventSponsors.sponsorId, sponsorId)
        )
      )
      .returning();
    return eventSponsor;
  }
}

export const storage = new DatabaseStorage();
