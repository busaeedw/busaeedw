import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { pool } from "./db";
import { 
  insertEventSchema,
  insertServiceProviderSchema,
  insertReviewSchema,
  insertMessageSchema,
  insertServiceBookingSchema,
  insertVenueSchema,
  registerUserSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  directResetPasswordSchema,
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import crypto from "crypto";

// Unified authentication middleware that supports both session and OIDC
const unifiedAuth = async (req: any, res: any, next: any) => {
  let userId: string | undefined;

  // Check for session-based authentication first
  if (req.session?.userId) {
    userId = req.session.userId;
  }
  // Fall back to OIDC authentication
  else if (req.user?.claims?.sub) {
    userId = req.user.claims.sub;
  }

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Set normalized user ID for use in routes
  req.authUserId = userId;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - supports both OIDC and session-based auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let userId: string | undefined;

      // Check for session-based authentication first
      if (req.session?.userId) {
        userId = req.session.userId;
      }
      // Fall back to OIDC authentication
      else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role (Admin only)
  app.patch('/api/auth/user/role', unifiedAuth, async (req: any, res) => {
    try {
      const currentUserId = req.authUserId;
      const { userId, role } = req.body;
      
      // Get current user to check admin status
      const currentUser = await storage.getUser(currentUserId);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can change user roles" });
      }
      
      if (!["admin", "organizer", "attendee", "service_provider"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Prevent setting admin role unless current user is admin (already checked above)
      if (role === 'admin' && currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can assign admin role" });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Username/Password Authentication Routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user by username in users table
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "User not found. Please check your username." });
      }

      // Check if user has a password set (not OIDC-only user)
      if (!user.password) {
        return res.status(401).json({ message: "This account does not support password login. Please use social login." });
      }

      // Verify password against database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect password. Please try again." });
      }

      // Set up session
      (req.session as any).userId = user.id;
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, username, firstName, lastName, password, role } = req.body;

      if (!email || !username || !firstName || !lastName || !password) {
        return res.status(400).json({ message: "Email, username, first name, last name, and password are required" });
      }

      // Check if user already exists by email
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Check if user already exists by username
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Create user (storage will handle password hashing)
      const newUser = await storage.upsertUser({
        email,
        username,
        firstName,
        lastName,
        password,
        role: role || "attendee"
      });

      // Set up session
      (req.session as any).userId = newUser.id;

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Return error if email not found
        return res.status(404).json({ 
          message: "This email is not registered before." 
        });
      }
      
      // Return success if email exists - frontend will show password reset form
      res.json({ 
        message: "Email verified successfully.",
        emailExists: true 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid email format",
          errors: error.errors 
        });
      }
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Direct reset password route (without token)
  app.post('/api/auth/reset-password-direct', async (req, res) => {
    try {
      const { email, password, confirmPassword } = directResetPasswordSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          message: "This email is not registered before." 
        });
      }
      
      // Hash the new password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Update user password
      await storage.updateUserPassword(user.id, passwordHash);
      
      // Invalidate all user sessions for security
      await storage.invalidateUserSessions(user.id);
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: error.errors 
        });
      }
      console.error("Error in direct reset password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Reset password route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password, confirmPassword } = resetPasswordSchema.parse(req.body);
      
      // Hash the token to match what's stored in the database
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Verify token is valid and not expired
      const resetToken = await storage.getValidResetToken(tokenHash);
      if (!resetToken) {
        return res.status(400).json({ 
          message: "Invalid or expired reset token" 
        });
      }
      
      // Hash the new password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Update user password
      await storage.updateUserPassword(resetToken.userId, passwordHash);
      
      // Mark token as used
      await storage.markResetTokenUsed(resetToken.id);
      
      // Invalidate all user sessions for security
      await storage.invalidateUserSessions(resetToken.userId);
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: error.errors 
        });
      }
      console.error("Error in reset password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const { category, city, search, limit, offset } = req.query;
      const events = await storage.getEvents({
        category: category as string,
        city: city as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== "organizer" && user.role !== "admin")) {
        return res.status(403).json({ message: "Only organizers can create events" });
      }

      const eventData = insertEventSchema.parse({ ...req.body, organizerId: userId });
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch('/api/events/:id', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);
      const event = await storage.getEvent(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.organizerId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedEvent = await storage.updateEvent(req.params.id, req.body);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);
      const event = await storage.getEvent(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.organizerId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Event registration routes
  app.post('/api/events/:id/register', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const eventId = req.params.id;

      const registration = await storage.registerForEvent({
        eventId,
        attendeeId: userId,
        ticketCode: `${eventId}-${userId}-${Date.now()}`,
        status: "registered",
      });

      res.status(201).json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.delete('/api/events/:id/register', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const eventId = req.params.id;

      await storage.cancelRegistration(eventId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error cancelling registration:", error);
      res.status(500).json({ message: "Failed to cancel registration" });
    }
  });

  app.get('/api/events/:id/registrations', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);
      const event = await storage.getEvent(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.organizerId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const registrations = await storage.getEventRegistrations(req.params.id);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // User's events and registrations
  app.get('/api/user/events', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const events = await storage.getEvents({ organizerId: userId });
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.get('/api/user/registrations', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const registrations = await storage.getUserRegistrations(userId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      res.status(500).json({ message: "Failed to fetch user registrations" });
    }
  });

  // Get all users (for browse functionality)
  app.get('/api/users', async (req, res) => {
    try {
      const { role, city, search, limit, offset } = req.query;
      
      // Build parameterized query safely
      let baseQuery = `
        SELECT id, email, first_name as "firstName", last_name as "lastName", 
               profile_image_url as "profileImageUrl", role, bio, phone, city, 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users 
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (role && typeof role === 'string') {
        baseQuery += ` AND role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }
      
      if (city && typeof city === 'string') {
        baseQuery += ` AND city = $${paramIndex}`;
        params.push(city);
        paramIndex++;
      }
      
      if (search && typeof search === 'string') {
        baseQuery += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      baseQuery += ` ORDER BY created_at DESC`;
      
      if (limit && typeof limit === 'string' && !isNaN(parseInt(limit))) {
        baseQuery += ` LIMIT $${paramIndex}`;
        params.push(parseInt(limit));
        paramIndex++;
      }
      
      if (offset && typeof offset === 'string' && !isNaN(parseInt(offset))) {
        baseQuery += ` OFFSET $${paramIndex}`;
        params.push(parseInt(offset));
      }
      
      const result = await pool.query(baseQuery, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Service provider routes
  app.get('/api/service-providers', async (req, res) => {
    try {
      const { category, verified, limit, offset } = req.query;
      const categoryStr = typeof category === 'string' && category.trim() !== '' ? category : undefined;
      const verifiedStr = typeof verified === 'string' && (verified === 'true' || verified === 'false') ? verified : undefined;
      const providers = await storage.getServiceProviders({
        category: categoryStr,
        verified: verifiedStr ? verifiedStr === 'true' : undefined,
        limit: typeof limit === 'string' && limit.trim() !== '' ? parseInt(limit) : undefined,
        offset: typeof offset === 'string' && offset.trim() !== '' ? parseInt(offset) : undefined,
      });
      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  app.get('/api/service-providers/:id', async (req, res) => {
    try {
      const provider = await storage.getServiceProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error fetching service provider:", error);
      res.status(500).json({ message: "Failed to fetch service provider" });
    }
  });

  app.post('/api/service-providers', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);

      if (!user || (user.role !== "service_provider" && user.role !== "admin")) {
        return res.status(403).json({ message: "Only service providers can create profiles" });
      }

      const providerData = insertServiceProviderSchema.parse({ ...req.body, userId });
      const provider = await storage.createServiceProvider(providerData);
      res.status(201).json(provider);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid provider data", errors: error.errors });
      }
      console.error("Error creating service provider:", error);
      res.status(500).json({ message: "Failed to create service provider" });
    }
  });

  // Review routes
  app.get('/api/reviews/:targetType/:targetId', async (req, res) => {
    try {
      const { targetType, targetId } = req.params;
      const reviews = await storage.getReviews(targetType, targetId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const reviewData = insertReviewSchema.parse({ ...req.body, reviewerId: userId });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Message routes
  app.get('/api/messages/:userId', unifiedAuth, async (req: any, res) => {
    try {
      const currentUserId = req.authUserId;
      const otherUserId = req.params.userId;
      const messages = await storage.getMessages(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/conversations', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/messages', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId: userId });
      const message = await storage.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Service booking routes
  app.post('/api/service-bookings', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const bookingData = insertServiceBookingSchema.parse({ ...req.body, organizerId: userId });
      const booking = await storage.createServiceBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating service booking:", error);
      res.status(500).json({ message: "Failed to create service booking" });
    }
  });

  app.get('/api/service-bookings', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const { eventId, serviceProviderId } = req.query;
      
      const bookings = await storage.getServiceBookings({
        eventId: eventId as string,
        serviceProviderId: serviceProviderId as string,
        organizerId: userId,
      });
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  // Statistics route
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getEventStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Venues CRUD endpoints
  
  // Get all venues with event counts
  app.get('/api/venues', async (req, res) => {
    try {
      const { search, city, limit = "50" } = req.query;
      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      
      // Build query with proper parameter indexing
      let query = `
        SELECT v.id, v.name as venue, v.name_ar as venue_ar, v.city, v.location,
               COUNT(e.id) as event_count
        FROM venues v
        LEFT JOIN events e ON v.id = e.venue_id AND e.status = 'published'
        WHERE 1=1
      `;
      
      let paramIndex = 1;
      const params: string[] = [];
      
      if (search && typeof search === 'string' && search.trim() !== '') {
        query += ` AND (v.name ILIKE $${paramIndex++} OR v.location ILIKE $${paramIndex++})`;
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
      }
      
      if (city && typeof city === 'string' && city.trim() !== '' && city !== 'all') {
        query += ` AND v.city ILIKE $${paramIndex++}`;
        params.push(`%${city.trim()}%`);
      }
      
      query += `
        GROUP BY v.id, v.name, v.name_ar, v.city, v.location
        ORDER BY event_count DESC, v.name ASC
        LIMIT $${paramIndex}
      `;
      params.push(limitNum.toString());
      
      const result = await pool.query(query, params);
      
      // Transform the result to ensure consistent format
      const venues = result.rows.map((row: any) => ({
        id: row.id,
        venue: row.venue,
        venue_ar: row.venue_ar,
        city: row.city,
        location: row.location,
        event_count: parseInt(row.event_count) || 0
      }));
      
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ message: "Failed to fetch venues", error: (error as Error).message });
    }
  });

  // Create new venue (admin/organizer only)
  app.post('/api/venues', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);
      
      // Only admins and organizers can create venues
      if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
        return res.status(403).json({ message: "Only admins and organizers can create venues" });
      }

      const venueData = insertVenueSchema.parse(req.body);
      const venue = await storage.createVenue(venueData);
      
      res.status(201).json(venue);
    } catch (error) {
      console.error("Error creating venue:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid venue data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create venue" });
    }
  });

  // Get single venue
  app.get('/api/venues/:id', async (req, res) => {
    try {
      const venue = await storage.getVenue(req.params.id);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ message: "Failed to fetch venue" });
    }
  });

  // Update venue (admin/organizer only)
  app.put('/api/venues/:id', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);
      
      // Only admins and organizers can update venues
      if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
        return res.status(403).json({ message: "Only admins and organizers can update venues" });
      }

      const venueData = insertVenueSchema.partial().parse(req.body);
      const venue = await storage.updateVenue(req.params.id, venueData);
      
      res.json(venue);
    } catch (error) {
      console.error("Error updating venue:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid venue data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update venue" });
    }
  });

  // Delete venue (admin only)
  app.delete('/api/venues/:id', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);
      
      // Only admins can delete venues
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can delete venues" });
      }

      await storage.deleteVenue(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting venue:", error);
      if (error instanceof Error && error.message.includes('currently used by')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete venue" });
    }
  });

  // Admin endpoint to seed Riyadh organizers (one-time use)
  app.post('/api/admin/seed-organizers', unifiedAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const user = await storage.getUser(userId);
      
      // Require admin role for admin operations
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can perform seeding operations" });
      }

      const { seedRiyadhOrganizers } = await import('./seedOrganizers');
      await seedRiyadhOrganizers();
      
      res.json({ message: "Successfully seeded 10 Riyadh event organizers" });
    } catch (error) {
      console.error("Error seeding organizers:", error);
      res.status(500).json({ message: "Failed to seed organizers" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
