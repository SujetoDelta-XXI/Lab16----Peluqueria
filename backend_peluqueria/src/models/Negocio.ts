import mongoose, { Schema, Document } from 'mongoose';

interface IHorarioOperacion {
  apertura: string;
  cierre: string;
  cerrado: boolean;
}

export interface INegocio extends Omit<Document, '_id'> {
  _id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horarioOperacion: {
    lunes: IHorarioOperacion;
    martes: IHorarioOperacion;
    miercoles: IHorarioOperacion;
    jueves: IHorarioOperacion;
    viernes: IHorarioOperacion;
    sabado: IHorarioOperacion;
    domingo: IHorarioOperacion;
  };
  tiempoBufferMinutos: number;
  ultimaActualizacion: Date;
}

const HorarioOperacionSchema = new Schema<IHorarioOperacion>({
  apertura: {
    type: String,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:mm)'],
    default: '09:00',
  },
  cierre: {
    type: String,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:mm)'],
    default: '18:00',
  },
  cerrado: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const NegocioSchema = new Schema<INegocio>({
  _id: {
    type: String,
    default: 'configuracion',
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del negocio es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres'],
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
  },
  horarioOperacion: {
    lunes: {
      type: HorarioOperacionSchema,
      default: () => ({ apertura: '09:00', cierre: '18:00', cerrado: false }),
    },
    martes: {
      type: HorarioOperacionSchema,
      default: () => ({ apertura: '09:00', cierre: '18:00', cerrado: false }),
    },
    miercoles: {
      type: HorarioOperacionSchema,
      default: () => ({ apertura: '09:00', cierre: '18:00', cerrado: false }),
    },
    jueves: {
      type: HorarioOperacionSchema,
      default: () => ({ apertura: '09:00', cierre: '18:00', cerrado: false }),
    },
    viernes: {
      type: HorarioOperacionSchema,
      default: () => ({ apertura: '09:00', cierre: '18:00', cerrado: false }),
    },
    sabado: {
      type: HorarioOperacionSchema,
      default: () => ({ apertura: '09:00', cierre: '14:00', cerrado: false }),
    },
    domingo: {
      type: HorarioOperacionSchema,
      default: () => ({ apertura: '00:00', cierre: '00:00', cerrado: true }),
    },
  },
  tiempoBufferMinutos: {
    type: Number,
    required: true,
    min: [0, 'El tiempo buffer no puede ser negativo'],
    max: [60, 'El tiempo buffer no puede exceder 60 minutos'],
    default: 15,
  },
  ultimaActualizacion: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: false,
  _id: false,
});

// Update ultimaActualizacion before saving
NegocioSchema.pre('save', function(next) {
  this.ultimaActualizacion = new Date();
  next();
});

export default mongoose.model<INegocio>('Negocio', NegocioSchema);
