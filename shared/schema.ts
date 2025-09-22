import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (supports both OIDC and email/password auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  username: varchar("username").unique(), // Optional for OIDC users
  password: varchar("password"), // Optional for OIDC users
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("attendee"), // admin, attendee, organizer, venue, services
  bio: text("bio"),
  phone: varchar("phone"),
  city: varchar("city"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("password_reset_tokens_user_id_idx").on(table.userId),
  index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
]);

// Venues table
export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar"),
  city: varchar("city").notNull(),
  location: varchar("location").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  venueType: varchar("venue_type"), // hotel, wedding_hall, cultural_center, mall, convention_center
  capacity: integer("capacity"),
  imageUrl: varchar("image_url"),
  imageUrls: text("image_urls").array(), // Multiple photos
  amenities: text("amenities").array(), // Features and amenities
  contactPhone: varchar("contact_phone"),
  contactEmail: varchar("contact_email"),
  website: varchar("website"),
  priceRange: varchar("price_range"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("venues_name_city_location_idx").on(table.name, table.city, table.location),
  index("venues_type_city_idx").on(table.venueType, table.city),
]);

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").notNull().references(() => organizers.id, { onDelete: "cascade" }),
  venueId: varchar("venue_id").references(() => venues.id, { onDelete: "set null" }),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  category: varchar("category").notNull(), // business, cultural, technology, entertainment
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location").notNull(),
  city: varchar("city").notNull(),
  venue: varchar("venue"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  currency: varchar("currency").notNull().default("SAR"),
  maxAttendees: integer("max_attendees"),
  imageUrl: varchar("image_url"),
  status: varchar("status").notNull().default("draft"), // draft, published, cancelled, completed
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("events_venue_id_idx").on(table.venueId),
]);

// Event registrations/tickets
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  attendeeId: varchar("attendee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("registered"), // registered, cancelled, attended
  ticketCode: varchar("ticket_code").notNull().unique(),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Service providers
export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: varchar("business_name").notNull(),
  category: varchar("category").notNull(), // catering, photography, entertainment, planning
  services: text("services").array(),
  priceRange: varchar("price_range"),
  portfolio: text("portfolio").array(), // URLs to portfolio images
  availability: jsonb("availability"), // Schedule data
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: varchar("target_type").notNull(), // event, service_provider
  targetId: varchar("target_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service bookings
export const serviceBookings = pgTable("service_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  serviceProviderId: varchar("service_provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  organizerId: varchar("organizer_id").notNull().references(() => organizers.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizers table - dedicated table for event organizers
export const organizers = pgTable("organizers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  phone: varchar("phone"),
  city: varchar("city"),
  businessName: varchar("business_name").notNull(),
  businessNameAr: varchar("business_name_ar"),
  category: varchar("category").notNull(), // entertainment, planning, catering, technology
  specialties: text("specialties").array(), // Services/areas of expertise
  yearsExperience: integer("years_experience"),
  priceRange: varchar("price_range"),
  portfolio: text("portfolio").array(), // URLs to portfolio images/videos
  website: varchar("website"),
  socialMedia: jsonb("social_media"), // Links to social media profiles
  availableServices: text("available_services").array(),
  businessDescription: text("business_description"),
  businessDescriptionAr: text("business_description_ar"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  totalEventsOrganized: integer("total_events_organized").default(0),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("organizers_email_idx").on(table.email),
  index("organizers_city_category_idx").on(table.city, table.category),
  index("organizers_verified_featured_idx").on(table.verified, table.featured),
]);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  eventRegistrations: many(eventRegistrations),
  serviceProvider: one(serviceProviders, {
    fields: [users.id],
    references: [serviceProviders.userId],
  }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  reviews: many(reviews),
}));

export const organizersRelations = relations(organizers, ({ many }) => ({
  events: many(events),
  serviceBookings: many(serviceBookings),
  reviews: many(reviews),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(organizers, {
    fields: [events.organizerId],
    references: [organizers.id],
  }),
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
  registrations: many(eventRegistrations),
  reviews: many(reviews),
  serviceBookings: many(serviceBookings),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  attendee: one(users, {
    fields: [eventRegistrations.attendeeId],
    references: [users.id],
  }),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
  bookings: many(serviceBookings),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const serviceBookingsRelations = relations(serviceBookings, ({ one }) => ({
  event: one(events, {
    fields: [serviceBookings.eventId],
    references: [events.id],
  }),
  serviceProvider: one(serviceProviders, {
    fields: [serviceBookings.serviceProviderId],
    references: [serviceProviders.id],
  }),
  organizer: one(organizers, {
    fields: [serviceBookings.organizerId],
    references: [organizers.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Registration schema with validation
export const registerUserSchema = createInsertSchema(users, {
  email: z.string().email("Please enter a valid email address"),
  username: z.string().regex(/^[a-zA-Z0-9._-]{3,30}$/, "Username must be 3-30 characters and contain only letters, numbers, dots, underscores, and hyphens"),
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name must be less than 50 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["attendee", "organizer", "venue", "services", "admin"]).default("attendee"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Direct reset password schema (without token)
export const directResetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const insertEventSchema = createInsertSchema(events, {
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registeredAt: true,
});

export const insertServiceBookingSchema = createInsertSchema(serviceBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
});

export const insertOrganizerSchema = createInsertSchema(organizers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

// Venue aggregate schema for venues endpoint
export const venueAggregateSchema = z.object({
  id: z.string(),
  venue: z.string(),
  venue_ar: z.string().optional().nullable(),
  city: z.string(),
  location: z.string(),
  event_count: z.number().or(z.string().transform(Number)), // Handle both number and string from DB
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type DirectResetPassword = z.infer<typeof directResetPasswordSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type VenueAggregate = z.infer<typeof venueAggregateSchema>;
export type Organizer = typeof organizers.$inferSelect;
export type InsertOrganizer = z.infer<typeof insertOrganizerSchema>;
