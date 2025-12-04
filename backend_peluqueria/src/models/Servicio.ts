import mongoose, { Schema, Document } from 'mongoose';

export interface IServicio extends Document {
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos: number;
  categoria: string;
  imagenUrl?: string;
  estado: 'activo' | 'inactivo';
  fechaCreacion: Date;
}

const ServicioSchema = new Schema<IServicio>({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    default: '',
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo'],
  },
  duracionMinutos: {
    type: Number,
    required: [true, 'La duración es requerida'],
    min: [15, 'La duración mínima es 15 minutos'],
    max: [480, 'La duración máxima es 480 minutos (8 horas)'],
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true,
    maxlength: [50, 'La categoría no puede exceder 50 caracteres'],
  },
  imagenUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Por favor ingrese una URL válida'],
    default: null,
  },
  estado: {
    type: String,
    required: true,
    enum: {
      values: ['activo', 'inactivo'],
      message: '{VALUE} no es un estado válido',
    },
    default: 'activo',
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
ServicioSchema.index({ estado: 1 });
ServicioSchema.index({ categoria: 1 });

export default mongoose.model<IServicio>('Servicio', ServicioSchema);
