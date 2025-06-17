import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const debugAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only debug JWT issues on specific routes
    if (req.path.includes('/users/me') || req.path.includes('/auth/verify')) {
      console.log('🔍 Auth Debug - Request Headers:', {
        auth: req.headers.authorization ? 'Bearer [hidden]' : 'None',
        path: req.path,
        method: req.method,
      });
      
      // Check for token
      let token = null;
      if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
        
        // Try to decode without verification
        try {
          const decoded = jwt.decode(token);
          console.log('🔍 Auth Debug - Token decoded:', {
            decoded,
            exp: decoded && typeof decoded === 'object' && 'exp' in decoded ? 
              new Date((decoded.exp as number) * 1000).toISOString() : 'N/A',
            currentTime: new Date().toISOString(),
            isExpired: decoded && typeof decoded === 'object' && 'exp' in decoded ? 
              (decoded.exp as number) * 1000 < Date.now() : 'Unknown'
          });
        } catch (e) {
          console.log('🔍 Auth Debug - Token decode failed:', e);
        }
        
        // Check if token can be verified
        try {
          const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
          console.log('🔍 Auth Debug - Token verified successfully');
        } catch (e) {
          console.log('🔍 Auth Debug - Token verification failed:', e);
        }
      } else {
        console.log('🔍 Auth Debug - No Bearer token found');
      }
    }
  } catch (error) {
    console.log('🔍 Auth Debug - Error:', error);
  }
  
  next();
};
