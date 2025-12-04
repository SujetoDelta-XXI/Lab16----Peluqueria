import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { Types } from 'mongoose';

export interface JWTPayload {
  userId: string;
  rol: 'cliente' | 'peluquero' | 'admin';
}

/**
 * Generate JWT token
 */
export const generateToken = (userId: Types.ObjectId, rol: 'cliente' | 'peluquero' | 'admin'): string => {
  const payload: JWTPayload = {
    userId: userId.toString(),
    rol,
  };

  return jwt.sign(payload, config.jwt.secret, { expiresIn: '24h' });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

/**
 * Decode JWT token without verification (for debugging)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};
