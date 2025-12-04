import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICita extends Document {
  clienteId: Types.ObjectId;
  peluqueroId: Types.ObjectId;
  servicioId: Types.ObjectId;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada' | 'NoAsistio';
  precioTotal: number;
  notasCliente?: string;
  fechaCreacion: Date;
  motivoCancelacion?: string;
  fechaCancelacion?: Date;
  canceladoPor?: 'cliente' | 'admin';
}

const CitaSchema = new Schema<ICita>({
  clienteId: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'El ID del cliente es requerido'],
  },
  peluqueroId: {
    type: Schema.Types.ObjectId,
    ref: 'Peluquero',
    required: [true, 'El ID del peluquero es requerido'],
  },
  servicioId: {
    type: Schema.Types.ObjectId,
    ref: 'Servicio',
    required: [true, 'El ID del servicio es requerido'],
  },
  fechaHoraInicio: {
    type: Date,
    required: [true, 'La fecha y hora de inicio es requerida'],
  },
  fechaHoraFin: {
    type: Date,
    required: [true, 'La fecha y hora de fin es requerida'],
  },
  estado: {
    type: String,
    required: true,
    enum: {
      values: ['Pendiente', 'Confirmada', 'Cancelada', 'Completada', 'NoAsistio'],
      message: '{VALUE} no es un estado válido',
    },
    default: 'Confirmada',
  },
  precioTotal: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    min: [0, 'El precio no puede ser negativo'],
  },
  notasCliente: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres'],
    default: '',
  },
  fechaCreacion: {
    type: Date,
    required: true,
    default: Date.now,
  },
  motivoCancelacion: {
    type: String,
    trim: true,
    maxlength: [500, 'El motivo no puede exceder 500 caracteres'],
    default: null,
  },
  fechaCancelacion: {
    type: Date,
    default: null,
  },
  canceladoPor: {
    type: String,
    enum: {
      values: ['cliente', 'admin'],
      message: '{VALUE} no es un valor válido',
    },
    default: null,
  },
}, {
  timestamps: false,
});

// Indexes
CitaSchema.index({ clienteId: 1 });
CitaSchema.index({ peluqueroId: 1 });
CitaSchema.index({ fechaHoraInicio: 1 });
CitaSchema.index({ estado: 1 });
CitaSchema.index({ peluqueroId: 1, fechaHoraInicio: 1, estado: 1 });

// Validation: fechaHoraFin must be after fechaHoraInicio
CitaSchema.pre('validate', function(next) {
  if (this.fechaHoraFin <= this.fechaHoraInicio) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  } else {
    next();
  }
});

export default mongoose.model<ICita>('Cita', CitaSchema);
