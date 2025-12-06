import { Response } from 'express';
import { Types } from 'mongoose';
import { Peluquero, Cita, Usuario } from '../models';

/**
 * Get hairstylist's agenda
 */
export const getAgenda = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { date, view } = req.query; // view: 'day' or 'week'

    // Get hairstylist
    const peluquero = await Peluquero.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Parse date
    const baseDate = date ? new Date(date as string) : new Date();
    if (isNaN(baseDate.getTime())) {
      res.status(400).json({
        error: {
          code: 'INVALID_DATE',
          message: 'Formato de fecha inválido',
        },
      });
      return;
    }

    // Calculate date range
    let startDate: Date;
    let endDate: Date;

    if (view === 'week') {
      // Get start of week (Monday)
      startDate = new Date(baseDate);
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);

      // Get end of week (Sunday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Day view
      startDate = new Date(baseDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get appointments
    const citas = await Cita.find({
      peluqueroId: peluquero._id,
      fechaHoraInicio: { $gte: startDate, $lte: endDate },
    })
      .populate('clienteId', 'usuarioId')
      .populate('servicioId', 'nombre precio duracionMinutos')
      .sort({ fechaHoraInicio: 1 });

    // Populate client user info
    for (const cita of citas) {
      if (cita.clienteId) {
        await cita.populate('clienteId.usuarioId', 'nombre telefono email');
      }
    }

    res.status(200).json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      view: view || 'day',
      citas,
      total: citas.length,
    });
  } catch (error: any) {
    console.error('Error al obtener agenda:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener agenda',
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

    // Get hairstylist
    const peluquero = await Peluquero.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Get appointment
    const cita = await Cita.findOne({
      _id: new Types.ObjectId(id),
      peluqueroId: peluquero._id,
    })
      .populate('clienteId', 'usuarioId')
      .populate('servicioId', 'nombre descripcion precio duracionMinutos categoria');

    if (!cita) {
      res.status(404).json({
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Cita no encontrada',
        },
      });
      return;
    }

    // Populate client user info
    if (cita.clienteId) {
      await cita.populate('clienteId.usuarioId', 'nombre telefono email');
    }

    // Get client's appointment history
    const historial = await Cita.find({
      clienteId: cita.clienteId,
      estado: 'Completada',
    })
      .populate('servicioId', 'nombre')
      .sort({ fechaHoraInicio: -1 })
      .limit(5);

    res.status(200).json({
      cita,
      historial,
    });
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
 * Mark appointment as completed
 */
export const completeAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get hairstylist
    const peluquero = await Peluquero.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Get appointment
    const cita = await Cita.findOne({
      _id: new Types.ObjectId(id),
      peluqueroId: peluquero._id,
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

    // Update status
    cita.estado = 'Completada';
    await cita.save();

    res.status(200).json({
      message: 'Cita marcada como completada',
      cita,
    });
  } catch (error: any) {
    console.error('Error al completar cita:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al completar cita',
        details: error.message,
      },
    });
  }
};

/**
 * Mark appointment as no-show
 */
export const markNoShow = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get hairstylist
    const peluquero = await Peluquero.findOne({ usuarioId: new Types.ObjectId(userId) });
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Get appointment
    const cita = await Cita.findOne({
      _id: new Types.ObjectId(id),
      peluqueroId: peluquero._id,
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

    // Update status
    cita.estado = 'NoAsistio';
    await cita.save();

    res.status(200).json({
      message: 'Cita marcada como no asistió',
      cita,
    });
  } catch (error: any) {
    console.error('Error al marcar no asistió:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al marcar no asistió',
        details: error.message,
      },
    });
  }
};

/**
 * Get hairstylist profile
 */
export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;

    const peluquero = await Peluquero.findOne({ usuarioId: new Types.ObjectId(userId) })
      .populate('usuarioId', 'nombre email telefono rol activo')
      .populate('serviciosEspecializados', 'nombre precio duracionMinutos');

    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Return structured data with usuario and peluquero separated
    res.status(200).json({ 
      usuario: peluquero.usuarioId,
      peluquero: {
        _id: peluquero._id,
        estado: peluquero.estado,
        serviciosEspecializados: peluquero.serviciosEspecializados,
        horarioDisponible: peluquero.horarioDisponible,
      }
    });
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener perfil',
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
