import { body, param, query } from 'express-validator';

export const createAppointmentValidation = [
  body('peluqueroId')
    .notEmpty().withMessage('El ID del peluquero es requerido')
    .isMongoId().withMessage('ID de peluquero inválido'),
  
  body('servicioId')
    .notEmpty().withMessage('El ID del servicio es requerido')
    .isMongoId().withMessage('ID de servicio inválido'),
  
  body('fechaHoraInicio')
    .notEmpty().withMessage('La fecha y hora de inicio es requerida')
    .isISO8601().withMessage('Formato de fecha inválido'),
  
  body('notasCliente')
    .optional()
    .isString().withMessage('Las notas deben ser texto')
    .isLength({ max: 500 }).withMessage('Las notas no pueden exceder 500 caracteres'),
];

export const cancelAppointmentValidation = [
  param('id')
    .notEmpty().withMessage('El ID de la cita es requerido')
    .isMongoId().withMessage('ID de cita inválido'),
  
  body('motivo')
    .optional()
    .isString().withMessage('El motivo debe ser texto')
    .isLength({ max: 500 }).withMessage('El motivo no puede exceder 500 caracteres'),
];

export const getAvailabilityValidation = [
  query('hairstylistId')
    .notEmpty().withMessage('El ID del peluquero es requerido')
    .isMongoId().withMessage('ID de peluquero inválido'),
  
  query('date')
    .notEmpty().withMessage('La fecha es requerida')
    .isISO8601().withMessage('Formato de fecha inválido'),
  
  query('serviceId')
    .notEmpty().withMessage('El ID del servicio es requerido')
    .isMongoId().withMessage('ID de servicio inválido'),
];

export const updateProfileValidation = [
  body('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
  
  body('telefono')
    .optional()
    .isString().withMessage('El teléfono debe ser texto')
    .matches(/^\+?[0-9\s\-()]+$/).withMessage('Formato de teléfono inválido')
    .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres'),
  
  body('preferencias')
    .optional()
    .isString().withMessage('Las preferencias deben ser texto')
    .isLength({ max: 1000 }).withMessage('Las preferencias no pueden exceder 1000 caracteres'),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es requerida')
    .isString().withMessage('La contraseña actual debe ser texto'),
  
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isString().withMessage('La nueva contraseña debe ser texto')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
];
