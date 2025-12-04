import { Router } from 'express';
import * as clientController from '../controllers/clientController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createAppointmentValidation,
  cancelAppointmentValidation,
  getAvailabilityValidation,
  updateProfileValidation,
  changePasswordValidation,
} from '../validators/clientValidators';

const router = Router();

// All routes require authentication as client
router.use(authenticateToken as any);
router.use(requireRole(['cliente']) as any);

/**
 * @route   GET /api/client/services
 * @desc    Get all active services
 * @access  Private (Client)
 */
router.get('/services', clientController.getServices);

/**
 * @route   GET /api/client/hairstylists
 * @desc    Get hairstylists specialized in a service
 * @access  Private (Client)
 * @query   serviceId - Service ID
 */
router.get('/hairstylists', clientController.getHairstylists);

/**
 * @route   GET /api/client/availability
 * @desc    Get available time slots
 * @access  Private (Client)
 * @query   hairstylistId, date, serviceId
 */
router.get(
  '/availability',
  validate(getAvailabilityValidation),
  clientController.getAvailability
);

/**
 * @route   POST /api/client/appointments
 * @desc    Create a new appointment
 * @access  Private (Client)
 */
router.post(
  '/appointments',
  validate(createAppointmentValidation),
  clientController.createAppointment
);

/**
 * @route   GET /api/client/appointments
 * @desc    Get client's appointments
 * @access  Private (Client)
 * @query   filter - 'upcoming' or 'history'
 */
router.get('/appointments', clientController.getAppointments);

/**
 * @route   GET /api/client/appointments/:id
 * @desc    Get appointment detail
 * @access  Private (Client)
 */
router.get('/appointments/:id', clientController.getAppointmentDetail);

/**
 * @route   PATCH /api/client/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private (Client)
 */
router.patch(
  '/appointments/:id/cancel',
  validate(cancelAppointmentValidation),
  clientController.cancelAppointment
);

/**
 * @route   PATCH /api/client/profile
 * @desc    Update client profile
 * @access  Private (Client)
 */
router.patch(
  '/profile',
  validate(updateProfileValidation),
  clientController.updateProfile
);

/**
 * @route   PATCH /api/client/change-password
 * @desc    Change password
 * @access  Private (Client)
 */
router.patch(
  '/change-password',
  validate(changePasswordValidation),
  clientController.changePassword
);

export default router;
