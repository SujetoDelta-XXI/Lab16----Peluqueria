import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No se proporcionó token de autenticación',
        },
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: error.message || 'Token inválido',
      },
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      });
      return;
    }

    if (!roles.includes(req.user.rol)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permisos para acceder a este recurso',
        },
      });
      return;
    }

    next();
  };
};
