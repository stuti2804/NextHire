import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Add user property to Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        // Removed role field
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", { tokenPrefix: token.substring(0, 10) + "..." });
      
      try {
        // Use a single consistent secret key
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
        
        if (!JWT_SECRET) {
          console.error("JWT_SECRET is not configured");
          return res.status(500).json({
            status: "error",
            message: "JWT configuration error",
          });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          exp?: number;
        };
        
        // Add additional expiration check
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return res.status(401).json({
            status: "error",
            message: "Token expired",
          });
        }
        
        const user = await User.findById(decoded.id);
        if (!user) {
          console.warn("No user found for token ID:", decoded.id);
          return res.status(401).json({
            status: "error",
            message: "User not found",
          });
        }
        
        // Set user on request object (without role)
        req.user = {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        };
        
        console.log("User authenticated:", {
          id: req.user.id.substring(0, 5) + "...",
          email: req.user.email,
          path: req.path,
        });
        
        next();
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError);
        return res.status(401).json({
          status: "error",
          message: "Invalid authentication token",
          details: process.env.NODE_ENV === 'development' ? 
            (jwtError as Error).message : undefined
        });
      }
    } else {
      console.warn("No Bearer token found in Authorization header");
      return res.status(401).json({
        status: "error",
        message: "No authentication token provided",
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication'
    });
  }
};

// Simplified middleware that doesn't require authentication for certain routes
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for login and register routes
  if (req.path.includes('/auth/login') || req.path.includes('/auth/register') || req.path === '/api/health') {
    return next();
  }
  
  return protect(req, res, next);
};

// Remove the restrictTo middleware as we're not using roles