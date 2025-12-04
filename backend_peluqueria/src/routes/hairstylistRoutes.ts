import { Router } from 'express';
import * as hairstylistController from '../controllers/hairstylistController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { changePasswordValidation } from '../validators/clientValidators';

const router = Router();

// All routes require authentication as hairstylist
router.use(authenticateToken as any);
router.use(requireRole(['peluquero']) as any);

/**
 * @route   GET /api/hairstylist/agenda
 * @desc    Get hairstylist's agenda
 * @access  Private (Hairstylist)
 * @query   date - Date (ISO 8601), view - 'day' or 'week'
 */
router.get('/agenda', hairstylistController.getAgenda);

/**
 * @route   GET /api/hairstylist/appointments/:id
 * @desc    Get appointment detail with client history
 * @access  Private (Hairstylist)
 */
router.get('/appointments/:id', hairstylistController.getAppointmentDetail);

/**
 * @route   PATCH /api/hairstylist/appointments/:id/complete
 * @desc    Mark appointment as completed
 * @access  Private (Hairstylist)
 */
router.patch('/appointments/:id/complete', hairstylistController.completeAppointment);

/**
 * @route   PATCH /api/hairstylist/appointments/:id/no-show
 * @desc    Mark appointment as no-show
 * @access  Private (Hairstylist)
 */
router.patch('/appointments/:id/no-show', hairstylistController.markNoShow);

/**
 * @route   GET /api/hairstylist/profile
 * @desc    Get hairstylist profile
 * @access  Private (Hairstylist)
 */
router.get('/profile', hairstylistController.getProfile);

/**
 * @route   PATCH /api/hairstylist/change-password
 * @desc    Change password
 * @access  Private (Hairstylist)
 */
router.patch(
  '/change-password',
  validate(changePasswordValidation),
  hairstylistController.changePassword
);

export default router;
