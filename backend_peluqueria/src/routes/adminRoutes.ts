import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication as admin
router.use(authenticateToken as any);
router.use(requireRole(['admin']) as any);

// ==================== SERVICES ====================

/**
 * @route   GET /api/admin/services
 * @desc    Get all services
 * @access  Private (Admin)
 */
router.get('/services', adminController.getServices);

/**
 * @route   POST /api/admin/services
 * @desc    Create a new service
 * @access  Private (Admin)
 */
router.post('/services', adminController.createService);

/**
 * @route   GET /api/admin/services/:id
 * @desc    Get service by ID
 * @access  Private (Admin)
 */
router.get('/services/:id', adminController.getServiceById);

/**
 * @route   PATCH /api/admin/services/:id
 * @desc    Update service
 * @access  Private (Admin)
 */
router.patch('/services/:id', adminController.updateService);

/**
 * @route   DELETE /api/admin/services/:id
 * @desc    Delete service
 * @access  Private (Admin)
 */
router.delete('/services/:id', adminController.deleteService);

/**
 * @route   PATCH /api/admin/services/:id/toggle-state
 * @desc    Toggle service state (activo/inactivo)
 * @access  Private (Admin)
 */
router.patch('/services/:id/toggle-state', adminController.toggleServiceState);

// ==================== HAIRSTYLISTS ====================

/**
 * @route   GET /api/admin/hairstylists
 * @desc    Get all hairstylists
 * @access  Private (Admin)
 * @query   estado - Filter by state (pendiente/activo/inactivo)
 */
router.get('/hairstylists', adminController.getHairstylists);

/**
 * @route   POST /api/admin/hairstylists
 * @desc    Create a new hairstylist
 * @access  Private (Admin)
 */
router.post('/hairstylists', adminController.createHairstylist);

/**
 * @route   GET /api/admin/hairstylists/:id
 * @desc    Get hairstylist by ID
 * @access  Private (Admin)
 */
router.get('/hairstylists/:id', adminController.getHairstylistById);

/**
 * @route   PATCH /api/admin/hairstylists/:id
 * @desc    Update hairstylist
 * @access  Private (Admin)
 */
router.patch('/hairstylists/:id', adminController.updateHairstylist);

/**
 * @route   PATCH /api/admin/hairstylists/:id/approve
 * @desc    Approve hairstylist (pendiente -> activo)
 * @access  Private (Admin)
 */
router.patch('/hairstylists/:id/approve', adminController.approveHairstylist);

/**
 * @route   PATCH /api/admin/hairstylists/:id/deactivate
 * @desc    Deactivate hairstylist
 * @access  Private (Admin)
 */
router.patch('/hairstylists/:id/deactivate', adminController.deactivateHairstylist);

/**
 * @route   PATCH /api/admin/hairstylists/:id/reactivate
 * @desc    Reactivate hairstylist
 * @access  Private (Admin)
 */
router.patch('/hairstylists/:id/reactivate', adminController.reactivateHairstylist);

/**
 * @route   DELETE /api/admin/hairstylists/:id
 * @desc    Delete hairstylist
 * @access  Private (Admin)
 */
router.delete('/hairstylists/:id', adminController.deleteHairstylist);

// ==================== ABSENCES ====================

/**
 * @route   GET /api/admin/ausencias
 * @desc    Get all absences
 * @access  Private (Admin)
 * @query   peluqueroId - Filter by hairstylist
 */
router.get('/ausencias', adminController.getAusencias);

/**
 * @route   POST /api/admin/ausencias
 * @desc    Create absence
 * @access  Private (Admin)
 */
router.post('/ausencias', adminController.createAusencia);

/**
 * @route   GET /api/admin/ausencias/:id
 * @desc    Get absence by ID
 * @access  Private (Admin)
 */
router.get('/ausencias/:id', adminController.getAusenciaById);

/**
 * @route   PATCH /api/admin/ausencias/:id
 * @desc    Update absence
 * @access  Private (Admin)
 */
router.patch('/ausencias/:id', adminController.updateAusencia);

/**
 * @route   DELETE /api/admin/ausencias/:id
 * @desc    Delete absence
 * @access  Private (Admin)
 */
router.delete('/ausencias/:id', adminController.deleteAusencia);

// ==================== APPOINTMENTS ====================

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments with filters
 * @access  Private (Admin)
 * @query   estado, peluqueroId, clienteId, fechaDesde, fechaHasta
 */
router.get('/appointments', adminController.getAppointments);

/**
 * @route   GET /api/admin/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private (Admin)
 */
router.get('/appointments/:id', adminController.getAppointmentById);

/**
 * @route   DELETE /api/admin/appointments/:id
 * @desc    Delete appointment
 * @access  Private (Admin)
 */
router.delete('/appointments/:id', adminController.deleteAppointment);

// ==================== CLIENTS ====================

/**
 * @route   GET /api/admin/clients
 * @desc    Get all clients
 * @access  Private (Admin)
 * @query   search - Search by name, email, or phone
 */
router.get('/clients', adminController.getClients);

/**
 * @route   GET /api/admin/clients/:id
 * @desc    Get client by ID
 * @access  Private (Admin)
 */
router.get('/clients/:id', adminController.getClientById);

/**
 * @route   PATCH /api/admin/clients/:id
 * @desc    Update client
 * @access  Private (Admin)
 */
router.patch('/clients/:id', adminController.updateClient);

/**
 * @route   PATCH /api/admin/clients/:id/toggle-state
 * @desc    Toggle client state (activo/inactivo)
 * @access  Private (Admin)
 */
router.patch('/clients/:id/toggle-state', adminController.toggleClientState);

/**
 * @route   DELETE /api/admin/clients/:id
 * @desc    Delete client
 * @access  Private (Admin)
 */
router.delete('/clients/:id', adminController.deleteClient);

// ==================== BUSINESS CONFIGURATION ====================

/**
 * @route   GET /api/admin/configuration
 * @desc    Get business configuration
 * @access  Private (Admin)
 */
router.get('/configuration', adminController.getConfiguration);

/**
 * @route   PATCH /api/admin/configuration
 * @desc    Update business configuration
 * @access  Private (Admin)
 */
router.patch('/configuration', adminController.updateConfiguration);

export default router;
