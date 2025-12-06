import { Response } from 'express';
import { Types } from 'mongoose';
import { Servicio, Peluquero, Usuario, Cliente, Cita, Ausencia, Negocio } from '../models';

// ==================== SERVICES ====================

/**
 * Get all services
 */
export const getServices = async (req: any, res: Response): Promise<void> => {
  try {
    const servicios = await Servicio.find().sort({ categoria: 1, nombre: 1 });

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
 * Create a new service
 */
export const createService = async (req: any, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, precio, duracionMinutos, categoria } = req.body;

    const servicio = await Servicio.create({
      nombre,
      descripcion,
      precio,
      duracionMinutos,
      categoria,
      estado: 'activo',
    });

    res.status(201).json({
      message: 'Servicio creado exitosamente',
      servicio,
    });
  } catch (error: any) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al crear servicio',
        details: error.message,
      },
    });
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const servicio = await Servicio.findById(id);
    if (!servicio) {
      res.status(404).json({
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Servicio no encontrado',
        },
      });
      return;
    }

    res.status(200).json({ servicio });
  } catch (error: any) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener servicio',
        details: error.message,
      },
    });
  }
};

/**
 * Update service
 */
export const updateService = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, duracionMinutos, categoria } = req.body;

    const servicio = await Servicio.findById(id);
    if (!servicio) {
      res.status(404).json({
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Servicio no encontrado',
        },
      });
      return;
    }

    if (nombre !== undefined) servicio.nombre = nombre;
    if (descripcion !== undefined) servicio.descripcion = descripcion;
    if (precio !== undefined) servicio.precio = precio;
    if (duracionMinutos !== undefined) servicio.duracionMinutos = duracionMinutos;
    if (categoria !== undefined) servicio.categoria = categoria;

    await servicio.save();

    res.status(200).json({
      message: 'Servicio actualizado exitosamente',
      servicio,
    });
  } catch (error: any) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al actualizar servicio',
        details: error.message,
      },
    });
  }
};

/**
 * Delete service
 */
export const deleteService = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const servicio = await Servicio.findByIdAndDelete(id);
    if (!servicio) {
      res.status(404).json({
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Servicio no encontrado',
        },
      });
      return;
    }

    res.status(200).json({
      message: 'Servicio eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al eliminar servicio',
        details: error.message,
      },
    });
  }
};

/**
 * Toggle service state
 */
export const toggleServiceState = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const servicio = await Servicio.findById(id);
    if (!servicio) {
      res.status(404).json({
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Servicio no encontrado',
        },
      });
      return;
    }

    servicio.estado = servicio.estado === 'activo' ? 'inactivo' : 'activo';
    await servicio.save();

    res.status(200).json({
      message: `Servicio ${servicio.estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
      servicio,
    });
  } catch (error: any) {
    console.error('Error al cambiar estado del servicio:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al cambiar estado del servicio',
        details: error.message,
      },
    });
  }
};

// ==================== HAIRSTYLISTS ====================

/**
 * Get all hairstylists
 */
export const getHairstylists = async (req: any, res: Response): Promise<void> => {
  try {
    const { estado } = req.query; // 'pendiente', 'activo', 'inactivo'

    const query: any = {};
    if (estado) {
      query.estado = estado;
    }

    const peluqueros = await Peluquero.find(query)
      .populate('usuarioId', 'nombre email telefono activo')
      .populate('serviciosEspecializados', 'nombre')
      .sort({ 'usuarioId.nombre': 1 });

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
 * Create a new hairstylist
 */
export const createHairstylist = async (req: any, res: Response): Promise<void> => {
  try {
    const { nombre, email, telefono, contrasena, serviciosEspecializados, horarioDisponible } = req.body;

    // Check if email already exists
    const existingUser = await Usuario.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        error: {
          code: 'EMAIL_EXISTS',
          message: 'El email ya está registrado',
        },
      });
      return;
    }

    // Create user
    const usuario = await Usuario.create({
      nombre,
      email: email.toLowerCase(),
      telefono,
      contrasena,
      rol: 'peluquero',
      activo: true, // Admin creates active hairstylists
    });

    // Create hairstylist
    const peluquero = await Peluquero.create({
      usuarioId: usuario._id,
      serviciosEspecializados,
      horarioDisponible: horarioDisponible || {},
      estado: 'activo', // Admin creates active hairstylists
    });

    await peluquero.populate([
      { path: 'usuarioId', select: 'nombre email telefono activo' },
      { path: 'serviciosEspecializados', select: 'nombre' },
    ]);

    res.status(201).json({
      message: 'Peluquero creado exitosamente',
      peluquero,
    });
  } catch (error: any) {
    console.error('Error al crear peluquero:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al crear peluquero',
        details: error.message,
      },
    });
  }
};

/**
 * Get hairstylist by ID
 */
export const getHairstylistById = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const peluquero = await Peluquero.findById(id)
      .populate('usuarioId', 'nombre email telefono activo')
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

    res.status(200).json({ peluquero });
  } catch (error: any) {
    console.error('Error al obtener peluquero:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener peluquero',
        details: error.message,
      },
    });
  }
};

/**
 * Update hairstylist
 */
export const updateHairstylist = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, telefono, serviciosEspecializados, horarioDisponible } = req.body;

    const peluquero = await Peluquero.findById(id).populate('usuarioId');
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Update user fields
    const usuario = peluquero.usuarioId as any;
    if (nombre !== undefined) usuario.nombre = nombre;
    if (telefono !== undefined) usuario.telefono = telefono;
    await usuario.save();

    // Update hairstylist fields
    if (serviciosEspecializados !== undefined) peluquero.serviciosEspecializados = serviciosEspecializados;
    if (horarioDisponible !== undefined) peluquero.horarioDisponible = horarioDisponible;
    await peluquero.save();

    await peluquero.populate([
      { path: 'usuarioId', select: 'nombre email telefono activo' },
      { path: 'serviciosEspecializados', select: 'nombre' },
    ]);

    res.status(200).json({
      message: 'Peluquero actualizado exitosamente',
      peluquero,
    });
  } catch (error: any) {
    console.error('Error al actualizar peluquero:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al actualizar peluquero',
        details: error.message,
      },
    });
  }
};

/**
 * Approve hairstylist (pendiente -> activo)
 */
export const approveHairstylist = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const peluquero = await Peluquero.findById(id).populate('usuarioId');
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Update hairstylist state
    peluquero.estado = 'activo';
    await peluquero.save();

    // Update user activo field
    const usuario = peluquero.usuarioId as any;
    usuario.activo = true;
    await usuario.save();

    res.status(200).json({
      message: 'Peluquero aprobado exitosamente',
      peluquero,
    });
  } catch (error: any) {
    console.error('Error al aprobar peluquero:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al aprobar peluquero',
        details: error.message,
      },
    });
  }
};

/**
 * Deactivate hairstylist
 */
export const deactivateHairstylist = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const peluquero = await Peluquero.findById(id).populate('usuarioId');
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Update hairstylist state
    peluquero.estado = 'inactivo';
    await peluquero.save();

    // Update user activo field
    const usuario = peluquero.usuarioId as any;
    usuario.activo = false;
    await usuario.save();

    res.status(200).json({
      message: 'Peluquero desactivado exitosamente',
      peluquero,
    });
  } catch (error: any) {
    console.error('Error al desactivar peluquero:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al desactivar peluquero',
        details: error.message,
      },
    });
  }
};

/**
 * Reactivate hairstylist
 */
export const reactivateHairstylist = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const peluquero = await Peluquero.findById(id).populate('usuarioId');
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Update hairstylist state
    peluquero.estado = 'activo';
    await peluquero.save();

    // Update user activo field
    const usuario = peluquero.usuarioId as any;
    usuario.activo = true;
    await usuario.save();

    res.status(200).json({
      message: 'Peluquero reactivado exitosamente',
      peluquero,
    });
  } catch (error: any) {
    console.error('Error al reactivar peluquero:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al reactivar peluquero',
        details: error.message,
      },
    });
  }
};

/**
 * Delete hairstylist
 */
export const deleteHairstylist = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const peluquero = await Peluquero.findById(id);
    if (!peluquero) {
      res.status(404).json({
        error: {
          code: 'HAIRSTYLIST_NOT_FOUND',
          message: 'Peluquero no encontrado',
        },
      });
      return;
    }

    // Delete user
    await Usuario.findByIdAndDelete(peluquero.usuarioId);

    // Delete hairstylist
    await Peluquero.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Peluquero eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar peluquero:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al eliminar peluquero',
        details: error.message,
      },
    });
  }
};

// ==================== ABSENCES ====================

/**
 * Get all absences
 */
export const getAusencias = async (req: any, res: Response): Promise<void> => {
  try {
    const { peluqueroId } = req.query;

    const query: any = {};
    if (peluqueroId) {
      query.peluqueroId = new Types.ObjectId(peluqueroId as string);
    }

    const ausencias = await Ausencia.find(query)
      .populate({
        path: 'peluqueroId',
        populate: {
          path: 'usuarioId',
          select: 'nombre email'
        }
      })
      .sort({ fechaInicio: -1 });

    res.status(200).json({
      ausencias,
      total: ausencias.length,
    });
  } catch (error: any) {
    console.error('Error al obtener ausencias:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener ausencias',
        details: error.message,
      },
    });
  }
};

/**
 * Create absence
 */
export const createAusencia = async (req: any, res: Response): Promise<void> => {
  try {
    const { peluqueroId, fechaInicio, fechaFin, motivo } = req.body;

    const ausencia = await Ausencia.create({
      peluqueroId,
      fechaInicio,
      fechaFin,
      motivo,
    });

    await ausencia.populate({
      path: 'peluqueroId',
      populate: {
        path: 'usuarioId',
        select: 'nombre email'
      }
    });

    res.status(201).json({
      message: 'Ausencia creada exitosamente',
      ausencia,
    });
  } catch (error: any) {
    console.error('Error al crear ausencia:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al crear ausencia',
        details: error.message,
      },
    });
  }
};

/**
 * Get absence by ID
 */
export const getAusenciaById = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ausencia = await Ausencia.findById(id)
      .populate({
        path: 'peluqueroId',
        populate: {
          path: 'usuarioId',
          select: 'nombre email'
        }
      });

    if (!ausencia) {
      res.status(404).json({
        error: {
          code: 'ABSENCE_NOT_FOUND',
          message: 'Ausencia no encontrada',
        },
      });
      return;
    }

    res.status(200).json({ ausencia });
  } catch (error: any) {
    console.error('Error al obtener ausencia:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener ausencia',
        details: error.message,
      },
    });
  }
};

/**
 * Update absence
 */
export const updateAusencia = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fechaInicio, fechaFin, motivo } = req.body;

    const ausencia = await Ausencia.findById(id);
    if (!ausencia) {
      res.status(404).json({
        error: {
          code: 'ABSENCE_NOT_FOUND',
          message: 'Ausencia no encontrada',
        },
      });
      return;
    }

    if (fechaInicio !== undefined) ausencia.fechaInicio = fechaInicio;
    if (fechaFin !== undefined) ausencia.fechaFin = fechaFin;
    if (motivo !== undefined) ausencia.motivo = motivo;

    await ausencia.save();
    await ausencia.populate({
      path: 'peluqueroId',
      populate: {
        path: 'usuarioId',
        select: 'nombre email'
      }
    });

    res.status(200).json({
      message: 'Ausencia actualizada exitosamente',
      ausencia,
    });
  } catch (error: any) {
    console.error('Error al actualizar ausencia:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al actualizar ausencia',
        details: error.message,
      },
    });
  }
};

/**
 * Delete absence
 */
export const deleteAusencia = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ausencia = await Ausencia.findByIdAndDelete(id);
    if (!ausencia) {
      res.status(404).json({
        error: {
          code: 'ABSENCE_NOT_FOUND',
          message: 'Ausencia no encontrada',
        },
      });
      return;
    }

    res.status(200).json({
      message: 'Ausencia eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar ausencia:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al eliminar ausencia',
        details: error.message,
      },
    });
  }
};

// ==================== APPOINTMENTS ====================

/**
 * Get all appointments with filters
 */
export const getAppointments = async (req: any, res: Response): Promise<void> => {
  try {
    const { estado, peluqueroId, clienteId, fechaDesde, fechaHasta } = req.query;

    const query: any = {};
    if (estado) query.estado = estado;
    if (peluqueroId) query.peluqueroId = new Types.ObjectId(peluqueroId as string);
    if (clienteId) query.clienteId = new Types.ObjectId(clienteId as string);
    
    if (fechaDesde || fechaHasta) {
      query.fechaHoraInicio = {};
      if (fechaDesde) query.fechaHoraInicio.$gte = new Date(fechaDesde as string);
      if (fechaHasta) query.fechaHoraInicio.$lte = new Date(fechaHasta as string);
    }

    const citas = await Cita.find(query)
      .populate('clienteId', 'usuarioId')
      .populate('peluqueroId', 'nombre email')
      .populate('servicioId', 'nombre precio duracionMinutos')
      .sort({ fechaHoraInicio: -1 });

    // Populate client user info
    for (const cita of citas) {
      if (cita.clienteId) {
        await cita.populate('clienteId.usuarioId', 'nombre telefono email');
      }
    }

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
 * Get appointment by ID
 */
export const getAppointmentById = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cita = await Cita.findById(id)
      .populate('clienteId', 'usuarioId')
      .populate('peluqueroId', 'nombre email')
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

    res.status(200).json({ cita });
  } catch (error: any) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener cita',
        details: error.message,
      },
    });
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cita = await Cita.findByIdAndDelete(id);
    if (!cita) {
      res.status(404).json({
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Cita no encontrada',
        },
      });
      return;
    }

    res.status(200).json({
      message: 'Cita eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al eliminar cita',
        details: error.message,
      },
    });
  }
};

// ==================== CLIENTS ====================

/**
 * Get all clients
 */
export const getClients = async (req: any, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    let clientes;
    if (search) {
      // Search in Usuario collection
      const usuarios = await Usuario.find({
        rol: 'cliente',
        $or: [
          { nombre: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { telefono: { $regex: search, $options: 'i' } },
        ],
      });

      const usuarioIds = usuarios.map(u => u._id);
      clientes = await Cliente.find({ usuarioId: { $in: usuarioIds } })
        .populate('usuarioId', 'nombre email telefono activo');
    } else {
      clientes = await Cliente.find()
        .populate('usuarioId', 'nombre email telefono activo');
    }

    res.status(200).json({
      clientes,
      total: clientes.length,
    });
  } catch (error: any) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener clientes',
        details: error.message,
      },
    });
  }
};

/**
 * Get client by ID
 */
export const getClientById = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findById(id)
      .populate('usuarioId', 'nombre email telefono activo fechaCreacion')
      .populate('preferencias.peluqueroFavorito', 'nombre')
      .populate('preferencias.serviciosFrecuentes', 'nombre');

    if (!cliente) {
      res.status(404).json({
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    // Get appointment count
    const citasCount = await Cita.countDocuments({ clienteId: cliente._id });

    res.status(200).json({
      cliente,
      citasCount,
    });
  } catch (error: any) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener cliente',
        details: error.message,
      },
    });
  }
};

/**
 * Update client
 */
export const updateClient = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, telefono, notasInternas } = req.body;

    const cliente = await Cliente.findById(id).populate('usuarioId');
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
    const usuario = cliente.usuarioId as any;
    if (nombre !== undefined) usuario.nombre = nombre;
    if (telefono !== undefined) usuario.telefono = telefono;
    await usuario.save();

    // Update client fields
    if (notasInternas !== undefined) cliente.notasInternas = notasInternas;
    await cliente.save();

    await cliente.populate('usuarioId', 'nombre email telefono activo');

    res.status(200).json({
      message: 'Cliente actualizado exitosamente',
      cliente,
    });
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al actualizar cliente',
        details: error.message,
      },
    });
  }
};

/**
 * Toggle client state
 */
export const toggleClientState = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findById(id).populate('usuarioId');
    if (!cliente) {
      res.status(404).json({
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    // Toggle client state
    cliente.estado = cliente.estado === 'activo' ? 'inactivo' : 'activo';
    await cliente.save();

    // Toggle user activo field
    const usuario = cliente.usuarioId as any;
    usuario.activo = cliente.estado === 'activo';
    await usuario.save();

    res.status(200).json({
      message: `Cliente ${cliente.estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
      cliente,
    });
  } catch (error: any) {
    console.error('Error al cambiar estado del cliente:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al cambiar estado del cliente',
        details: error.message,
      },
    });
  }
};

/**
 * Delete client
 */
export const deleteClient = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findById(id);
    if (!cliente) {
      res.status(404).json({
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    // Delete user
    await Usuario.findByIdAndDelete(cliente.usuarioId);

    // Delete client
    await Cliente.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Cliente eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al eliminar cliente',
        details: error.message,
      },
    });
  }
};

// ==================== BUSINESS CONFIGURATION ====================

/**
 * Get business configuration
 */
export const getConfiguration = async (req: any, res: Response): Promise<void> => {
  try {
    const negocio = await Negocio.findById('configuracion');
    
    if (!negocio) {
      res.status(404).json({
        error: {
          code: 'CONFIGURATION_NOT_FOUND',
          message: 'Configuración no encontrada',
        },
      });
      return;
    }

    res.status(200).json({ negocio });
  } catch (error: any) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al obtener configuración',
        details: error.message,
      },
    });
  }
};

/**
 * Update business configuration
 */
export const updateConfiguration = async (req: any, res: Response): Promise<void> => {
  try {
    const { nombre, direccion, telefono, email, horarioOperacion, tiempoBufferMinutos } = req.body;

    let negocio = await Negocio.findById('configuracion');
    
    if (!negocio) {
      // Create if doesn't exist
      negocio = await Negocio.create({
        _id: 'configuracion',
        nombre: nombre || 'Mi Peluquería',
        direccion: direccion || '',
        telefono: telefono || '',
        email: email || '',
        horarioOperacion: horarioOperacion || {},
        tiempoBufferMinutos: tiempoBufferMinutos || 15,
      });
    } else {
      // Update existing
      if (nombre !== undefined) negocio.nombre = nombre;
      if (direccion !== undefined) negocio.direccion = direccion;
      if (telefono !== undefined) negocio.telefono = telefono;
      if (email !== undefined) negocio.email = email;
      if (horarioOperacion !== undefined) negocio.horarioOperacion = horarioOperacion;
      if (tiempoBufferMinutos !== undefined) negocio.tiempoBufferMinutos = tiempoBufferMinutos;
      
      negocio.ultimaActualizacion = new Date();
      await negocio.save();
    }

    res.status(200).json({
      message: 'Configuración actualizada exitosamente',
      negocio,
    });
  } catch (error: any) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al actualizar configuración',
        details: error.message,
      },
    });
  }
};
