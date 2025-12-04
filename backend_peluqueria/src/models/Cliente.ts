import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICliente extends Document {
  usuarioId: Types.ObjectId;
  preferencias: {
    peluqueroFavorito?: Types.ObjectId;
    serviciosFrecuentes: Types.ObjectId[];
  };
  notasInternas?: string;
  estado: 'activo' | 'inactivo';
}

const ClienteSchema = new Schema<ICliente>({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El ID de usuario es requerido'],
    unique: true,
  },
  preferencias: {
    peluqueroFavorito: {
      type: Schema.Types.ObjectId,
      ref: 'Peluquero',
      default: null,
    },
    serviciosFrecuentes: [{
      type: Schema.Types.ObjectId,
      ref: 'Servicio',
    }],
  },
  notasInternas: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres'],
    default: '',
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
}, {
  timestamps: false,
});

// Indexes
ClienteSchema.index({ usuarioId: 1 }, { unique: true });
ClienteSchema.index({ estado: 1 });

export default mongoose.model<ICliente>('Cliente', ClienteSchema);
