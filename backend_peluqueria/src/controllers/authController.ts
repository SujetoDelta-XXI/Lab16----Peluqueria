import { Request, Response } from 'express';
import { Usuario, Cliente, Peluquero } from '../models';
import { generateToken } from '../utils/jwt';
import { Types } from 'mongoose';

/**
 * Register a new user (client or hairstylist)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, telefono, contrasena, rol, serviciosEspecializados, horarioDisponible } = req.body;

    // Check if user already exists
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'El email ya está registrado',
        },
      });
      return;
    }

    // Create user
    const usuario = await Usuario.create({
      nombre,
      email,
      telefono,
      contrasena,
      rol,
      activo: rol === 'cliente', // Clients are active immediately, hairstylists need approval
    });

    // Create corresponding profile
    if (rol === 'cliente') {
      await Cliente.create({
        usuarioId: usuario._id,
        estado: 'activo',
      });

      // Generate token for client
      const token = generateToken(usuario._id, usuario.rol);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(201).json({
        message: 'Cliente registrado exitosamente',
        user: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
        token,
        redirectUrl: '/cliente/dashboard',
      });
    } else if (rol === 'peluquero') {
      await Peluquero.create({
        usuarioId: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        serviciosEspecializados: serviciosEspecializados || [],
        horarioDisponible: horarioDisponible || {},
        estado: 'pendiente',
      });

      res.status(201).json({
        message: 'Solicitud de peluquero enviada. Un administrador revisará tu perfil.',
        user: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
        requiresApproval: true,
      });
    }
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al registrar usuario',
        details: error.message,
      },
    });
  }
};

/**
 * Login with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, contrasena } = req.body;

    // Find user
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email o contraseña incorrectos',
        },
      });
      return;
    }

    // Check password
    const isPasswordValid = await usuario.comparePassword(contrasena);
    if (!isPasswordValid) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email o contraseña incorrectos',
        },
      });
      return;
    }

    // Check if account is active
    if (!usuario.activo) {
      if (usuario.rol === 'peluquero') {
        res.status(403).json({
          error: {
            code: 'ACCOUNT_PENDING',
            message: 'Tu cuenta está pendiente de aprobación por un administrador',
          },
        });
        return;
      } else {
        res.status(403).json({
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Tu cuenta ha sido desactivada. Contacta al administrador',
          },
        });
        return;
      }
    }

    // Update last access
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // Generate token
    const token = generateToken(usuario._id, usuario.rol);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Determine redirect URL based on role
    let redirectUrl = '/';
    switch (usuario.rol) {
      case 'cliente':
        redirectUrl = '/cliente/dashboard';
        break;
      case 'peluquero':
        redirectUrl = '/peluquero/agenda';
        break;
      case 'admin':
        redirectUrl = '/admin/dashboard';
        break;
    }

    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
      token,
      redirectUrl,
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al iniciar sesión',
        details: error.message,
      },
    });
  }
};

/**
 * Logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear cookie
    res.clearCookie('token');

    res.status(200).json({
      message: 'Logout exitoso',
    });
  } catch (error: any) {
    console.error('Error en logout:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al cerrar sesión',
        details: error.message,
      },
    });
  }
};

/**
 * Get current user info
 */
export const me = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No autenticado',
        },
      });
      return;
    }

    const usuario = await Usuario.findById(req.user.userId);
    if (!usuario) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado',
        },
      });
      return;
    }

    res.status(200).json({
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        activo: usuario.activo,
        fechaCreacion: usuario.fechaCreacion,
      },
    });
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener información del usuario',
        details: error.message,
      },
    });
  }
};

/**
 * Initiate Google OAuth
 */
export const googleAuth = (req: Request, res: Response): void => {
  // This will be handled by passport middleware
};

/**
 * Google OAuth callback
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is authenticated by passport
    const user = req.user as any;

    // If user is already in database (existing user)
    if (user._id) {
      const token = generateToken(user._id, user.rol);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      let redirectUrl = '/';
      switch (user.rol) {
        case 'cliente':
          redirectUrl = '/cliente/dashboard';
          break;
        case 'peluquero':
          redirectUrl = '/peluquero/agenda';
          break;
        case 'admin':
          redirectUrl = '/admin/dashboard';
          break;
      }

      res.redirect(redirectUrl);
    } else {
      // New user from Google - need to complete registration
      // Store Google profile in session and redirect to role selection
      res.redirect(`/registro/google?email=${user.emails[0].value}&nombre=${user.displayName}`);
    }
  } catch (error: any) {
    console.error('Error en Google callback:', error);
    res.redirect('/login?error=google_auth_failed');
  }
};


/**
 * Get active services (public endpoint for registration)
 */
export const getPublicServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Servicio } = await import('../models');
    const servicios = await Servicio.find({ estado: 'activo' }).select('nombre descripcion precio duracionMinutos categoria');
    
    res.status(200).json({
      servicios,
    });
  } catch (error: any) {
    console.error('Error al obtener servicios públicos:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener servicios',
      },
    });
  }
};
