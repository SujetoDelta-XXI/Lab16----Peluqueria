import { Response } from 'express';
import { Types } from 'mongoose';
import { Cliente, Servicio, Peluquero, Cita, Negocio } from '../models';
import { calculateAvailableSlots } from '../services/availabilityService';

/**
 * Get all active services
 */
export const getServices = async (req: any, res: Response): Promise<void> => {
  try {
    const servicios = await Servicio.find({ estado: 'activo' }).sort({ categoria: 1, nombre: 1 });

    res.status(200).json({
      servicios,
      total: servicios.length,
    });
  } catch (error: any) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener servicios',
        details: error.message,
      },
    });
  }
};

/**
 * Get hairstylists specialized in a service
 */
export const getHairstylists = async (req: any, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.query;

    if (!serviceId) {
      res.status(400).json({
        error: {
          code: 'MISSING_PARAMETER',
          message: 'El parámetro serviceId es requerido',
        },
      });
      return;
    }

    const peluqueros = await Peluquero.find({
      serviciosEspecializados: new Types.ObjectId(serviceId as string),
      estado: 'activo',
    })
      .populate('serviciosEspecializados', 'nombre precio duracionMinutos')
      .select('nombre email serviciosEspecializados');

    res.status(200).json({
      peluqueros,
      total: peluqueros.length,
    });
  } catch (error: any) {
    console.error('Error al obtener peluqueros:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener peluqueros',
        details: error.message,
      },
    });
  }
};

/**
 * Get available time slots
 */
export const getAvailability = async (req: any, res: Response): Promise<void> => {
  try {
    const { hairstylistId, date, serviceId } = req.query;

    if (!hairstylistId || !date || !serviceId) {
      res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Los parámetros hairstylistId, date y serviceId son requeridos',
        },
      });
      return;
    }

    const fecha = new Date(date as string);
    if (isNaN(fecha.getTime())) {
      res.status(400).json({
        error: {
          code: 'INVALID_DATE',
          message: 'Formato de fecha inválido',
        },
      });
      return;
    }

    const slots = await calculateAvailableSlots({
      peluqueroId: hairstylistId as string,
      fecha,
      servicioId: serviceId as string,
    });

    res.status(200).json({
      fecha: fecha.toISOString().split('T')[0],
      slots,
      total: slots.length,
    });
  } catch (error: any) {
    console.error('Error al calcular disponibilidad:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al calcular disponibilidad',
        details: error.message,
      },
    });
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { peluqueroId, servicioId, fechaHoraInicio, notasCliente } = req.body;
    const userId = req.user.userId;

    // Get client
    const cliente = await Cliente.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!cliente) {
      res.status(404).json({
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    // Validate service exists
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) {
      res.status(404).json({
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Servicio no encontrado',
        },
      });
      return;
    }

    // Validate hairstylist exists and specializes in service
    const peluquero = await Peluquero.findById(peluqueroId);
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    if (!peluquero.serviciosEspecializados.some(s => s.toString() === servicioId)) {
      res.status(422).json({
        error: {
          code: 'HAIRSTYLIST_NOT_SPECIALIZED',
          message: 'El peluquero no está especializado en este servicio',
        },
      });
      return;
    }

    // Get buffer time
    const negocio = await Negocio.findById('configuracion');
    if (!negocio) {
      throw new Error('Configuración del negocio no encontrada');
    }

    // Calculate end time
    const inicio = new Date(fechaHoraInicio);
    const fin = new Date(inicio.getTime() + (servicio.duracionMinutos + negocio.tiempoBufferMinutos) * 60000);

    // Create appointment
    const cita = await Cita.create({
      clienteId: cliente._id,
      peluqueroId,
      servicioId,
      fechaHoraInicio: inicio,
      fechaHoraFin: fin,
      estado: 'Confirmada',
      precioTotal: servicio.precio,
      notasCliente: notasCliente || '',
    });

    // Populate for response
    await cita.populate([
      { path: 'servicioId', select: 'nombre precio duracionMinutos' },
      { path: 'peluqueroId', select: 'nombre email' },
    ]);

    res.status(201).json({
      message: 'Cita creada exitosamente',
      cita,
    });
  } catch (error: any) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al crear cita',
        details: error.message,
      },
    });
  }
};

/**
 * Get client's appointments
 */
export const getAppointments = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { filter } = req.query; // 'upcoming' or 'history'

    // Get client
    const cliente = await Cliente.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!cliente) {
      res.status(404).json({
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    const now = new Date();
    let query: any = { clienteId: cliente._id };

    if (filter === 'upcoming') {
      query.fechaHoraInicio = { $gte: now };
      query.estado = { $in: ['Confirmada', 'Pendiente'] };
    } else if (filter === 'history') {
      query.$or = [
        { fechaHoraInicio: { $lt: now } },
        { estado: { $in: ['Cancelada', 'Completada', 'NoAsistio'] } },
      ];
    }

    const citas = await Cita.find(query)
      .populate('servicioId', 'nombre precio duracionMinutos')
      .populate('peluqueroId', 'nombre email')
      .sort({ fechaHoraInicio: filter === 'history' ? -1 : 1 });

    res.status(200).json({
      citas,
      total: citas.length,
    });
  } catch (error: any) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener citas',
        details: error.message,
      },
    });
  }
};

/**
 * Get appointment detail
 */
export const getAppointmentDetail = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get client
    const cliente = await Cliente.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!cliente) {
      res.status(404).json({
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    const cita = await Cita.findOne({
      _id: new Types.ObjectId(id),
      clienteId: cliente._id,
    })
      .populate('servicioId', 'nombre descripcion precio duracionMinutos categoria')
      .populate('peluqueroId', 'nombre email');

    if (!cita) {
      res.status(404).json({
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Cita no encontrada',
        },
      });
      return;
    }

    res.status(200).json({ cita });
  } catch (error: any) {
    console.error('Error al obtener detalle de cita:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener detalle de cita',
        details: error.message,
      },
    });
  }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const userId = req.user.userId;

    // Get client
    const cliente = await Cliente.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!cliente) {
      res.status(404).json({
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    const cita = await Cita.findOne({
      _id: new Types.ObjectId(id),
      clienteId: cliente._id,
    });

    if (!cita) {
      res.status(404).json({
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Cita no encontrada',
        },
      });
      return;
    }

    // Check if appointment can be cancelled (more than 24 hours before)
    const now = new Date();
    const hoursUntilAppointment = (cita.fechaHoraInicio.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      res.status(422).json({
        error: {
          code: 'CANCELLATION_TOO_LATE',
          message: 'No se puede cancelar una cita con menos de 24 horas de anticipación',
        },
      });
      return;
    }

    // Update appointment
    cita.estado = 'Cancelada';
    cita.motivoCancelacion = motivo || 'Cancelado por el cliente';
    cita.fechaCancelacion = now;
    cita.canceladoPor = 'cliente';
    await cita.save();

    res.status(200).json({
      message: 'Cita cancelada exitosamente',
      cita,
    });
  } catch (error: any) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al cancelar cita',
        details: error.message,
      },
    });
  }
};

/**
 * Update client profile
 */
export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { nombre, telefono, preferencias } = req.body;

    // Get user
    const Usuario = (await import('../models')).Usuario;
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado',
        },
      });
      return;
    }

    // Get client
    const cliente = await Cliente.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!cliente) {
      res.status(404).json({
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    // Update user fields
    if (nombre !== undefined) usuario.nombre = nombre;
    if (telefono !== undefined) usuario.telefono = telefono;
    await usuario.save();

    // Update client preferences
    if (preferencias !== undefined) {
      cliente.preferencias = preferencias;
      await cliente.save();
    }

    // Reload with populated data
    await cliente.populate('usuarioId', 'nombre email telefono rol activo');

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      cliente,
    });
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al actualizar perfil',
        details: error.message,
      },
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get user
    const Usuario = (await import('../models')).Usuario;
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado',
        },
      });
      return;
    }

    // Verify current password
    const isValidPassword = await usuario.comparePassword(currentPassword);
    if (!isValidPassword) {
      res.status(401).json({
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Contraseña actual incorrecta',
        },
      });
      return;
    }

    // Update password
    usuario.contrasena = newPassword;
    await usuario.save();

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al cambiar contraseña',
        details: error.message,
      },
    });
  }
};
