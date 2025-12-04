import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAusencia extends Document {
  peluqueroId: Types.ObjectId;
  fechaInicio: Date;
  fechaFin: Date;
  motivo: 'Vacaciones' | 'Enfermedad' | 'Otro';
  descripcion?: string;
  fechaCreacion: Date;
}

const AusenciaSchema = new Schema<IAusencia>({
  peluqueroId: {
    type: Schema.Types.ObjectId,
    ref: 'Peluquero',
    required: [true, 'El ID del peluquero es requerido'],
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida'],
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es requerida'],
  },
  motivo: {
    type: String,
    required: [true, 'El motivo es requerido'],
    enum: {
      values: ['Vacaciones', 'Enfermedad', 'Otro'],
      message: '{VALUE} no es un motivo válido',
    },
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    default: '',
  },
  fechaCreacion: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: false,
});

// Indexes
AusenciaSchema.index({ peluqueroId: 1 });
AusenciaSchema.index({ peluqueroId: 1, fechaInicio: 1, fechaFin: 1 });

// Validation: fechaFin must be >= fechaInicio
AusenciaSchema.pre('validate', function(next) {
  if (this.fechaFin < this.fechaInicio) {
    next(new Error('La fecha de fin debe ser igual o posterior a la fecha de inicio'));
  } else {
    next();
  }
});

export default mongoose.model<IAusencia>('Ausencia', AusenciaSchema);
