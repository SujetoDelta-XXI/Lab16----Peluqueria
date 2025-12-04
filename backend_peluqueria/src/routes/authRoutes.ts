import { Router } from 'express';
import passport from '../config/passport';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerValidation, loginValidation } from '../validators/authValidators';

const router = Router();

/**
 * @route   GET /api/auth/services
 * @desc    Get active services (public for registration)
 * @access  Public
 */
router.get('/services', authController.getPublicServices);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (client or hairstylist)
 * @access  Public
 */
router.post('/register', validate(registerValidation), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', validate(loginValidation), authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authenticateToken as any, authController.me);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=google_auth_failed',
  }),
  authController.googleCallback
);

export default router;
