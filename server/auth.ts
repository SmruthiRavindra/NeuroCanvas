import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import type { Express } from "express";
import session from "express-session";
import type { User } from "@shared/schema";
import bcrypt from "bcryptjs";

// Configure passport local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      // Compare password using bcrypt
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Serialize user for session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export function setupAuth(app: Express) {
  // Ensure SESSION_SECRET is set
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    console.warn("⚠️ WARNING: SESSION_SECRET not set. Using fallback (insecure for production)");
  }

  // Setup session middleware
  app.use(
    session({
      secret: sessionSecret || "neurocanvas-dev-secret-DO-NOT-USE-IN-PRODUCTION",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// Extend Express User type
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      password: string;
      email: string | null;
      phone: string | null;
      guardianName: string | null;
      guardianPhone: string | null;
      guardianRelationship: string | null;
      personality: string | null;
      interests: string | null;
      hasCompletedGuardianSetup: boolean;
      hasCompletedOnboarding: boolean;
      createdAt: Date;
    }
  }
}
