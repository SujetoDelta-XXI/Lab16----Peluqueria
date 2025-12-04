import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  telefono: string;
  contrasena: string;
  rol: 'cliente' | 'peluquero' | 'admin';
  activo: boolean;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UsuarioSchema = new Schema<IUsuario>({
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
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true,
    match: [/^\+?[0-9\s\-]+$/, 'Por favor ingrese un teléfono válido'],
  },
  contrasena: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
  },
  rol: {
    type: String,
    required: [true, 'El rol es requerido'],
    enum: {
      values: ['cliente', 'peluquero', 'admin'],
      message: '{VALUE} no es un rol válido',
    },
  },
  activo: {
    type: Boolean,
    required: true,
    default: function(this: IUsuario) {
      return this.rol === 'cliente';
    },
  },
  fechaCreacion: {
    type: Date,
    required: true,
    default: Date.now,
  },
  ultimoAcceso: {
    type: Date,
    default: null,
  },
}, {
  timestamps: false,
});

// Indexes
UsuarioSchema.index({ email: 1 }, { unique: true });
UsuarioSchema.index({ rol: 1 });

// Hash password before saving
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UsuarioSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.contrasena);
};

// Don't return password in JSON
UsuarioSchema.set('toJSON', {
  transform: function(doc, ret) {
    const { contrasena, ...rest } = ret;
    return rest;
  },
});

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);
