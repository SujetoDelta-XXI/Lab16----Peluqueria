import { body } from 'express-validator';

export const registerValidation = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es requerido')
    .matches(/^\+?[0-9\s\-]+$/).withMessage('Formato de teléfono inválido'),
  
  body('contrasena')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['cliente', 'peluquero']).withMessage('El rol debe ser cliente o peluquero'),
  
  body('serviciosEspecializados')
    .optional()
    .isArray().withMessage('Los servicios especializados deben ser un array')
    .custom((value, { req }) => {
      if (req.body.rol === 'peluquero' && (!value || value.length === 0)) {
        throw new Error('Los peluqueros deben tener al menos un servicio especializado');
      }
      return true;
    }),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('contrasena')
    .notEmpty().withMessage('La contraseña es requerida'),
];
