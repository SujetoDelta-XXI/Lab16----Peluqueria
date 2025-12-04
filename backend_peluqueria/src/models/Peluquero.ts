import mongoose, { Schema, Document, Types } from 'mongoose';

interface IHorarioDia {
  entrada: string;
  salida: string;
}

export interface IPeluquero extends Document {
  usuarioId: Types.ObjectId;
  nombre: string;
  email: string;
  serviciosEspecializados: Types.ObjectId[];
  horarioDisponible: {
    lunes?: IHorarioDia;
    martes?: IHorarioDia;
    miercoles?: IHorarioDia;
    jueves?: IHorarioDia;
    viernes?: IHorarioDia;
    sabado?: IHorarioDia;
    domingo?: IHorarioDia;
  };
  estado: 'pendiente' | 'activo' | 'inactivo';
  fechaSolicitud: Date;
  fechaAprobacion?: Date;
}

const HorarioDiaSchema = new Schema<IHorarioDia>({
  entrada: {
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:mm)'],
  },
  salida: {
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:mm)'],
  },
}, { _id: false });

const PeluqueroSchema = new Schema<IPeluquero>({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El ID de usuario es requerido'],
    unique: true,
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
  },
  serviciosEspecializados: [{
    type: Schema.Types.ObjectId,
    ref: 'Servicio',
    required: true,
  }],
  horarioDisponible: {
    lunes: HorarioDiaSchema,
    martes: HorarioDiaSchema,
    miercoles: HorarioDiaSchema,
    jueves: HorarioDiaSchema,
    viernes: HorarioDiaSchema,
    sabado: HorarioDiaSchema,
    domingo: HorarioDiaSchema,
  },
  estado: {
    type: String,
    required: true,
    enum: {
      values: ['pendiente', 'activo', 'inactivo'],
      message: '{VALUE} no es un estado válido',
    },
    default: 'pendiente',
  },
  fechaSolicitud: {
    type: Date,
    required: true,
    default: Date.now,
  },
  fechaAprobacion: {
    type: Date,
    default: null,
  },
}, {
  timestamps: false,
});

// Indexes
PeluqueroSchema.index({ usuarioId: 1 }, { unique: true });
PeluqueroSchema.index({ estado: 1 });
PeluqueroSchema.index({ serviciosEspecializados: 1 });

// Validation: must have at least one specialized service
PeluqueroSchema.path('serviciosEspecializados').validate(function(value: Types.ObjectId[]) {
  return value && value.length > 0;
}, 'Debe tener al menos un servicio especializado');

export default mongoose.model<IPeluquero>('Peluquero', PeluqueroSchema);
