'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import Link from 'next/link';

interface RegisterForm {
  nombre: string;
  email: string;
  telefono: string;
  contrasena: string;
  confirmarContrasena: string;
  rol: 'cliente' | 'peluquero';
  serviciosEspecializados?: string[];
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: {
      rol: 'cliente',
    },
  });

  const rol = watch('rol');
  const contrasena = watch('contrasena');

  // Cargar servicios si es peluquero
  useEffect(() => {
    if (rol === 'peluquero') {
      const loadServicios = async () => {
        try {
          const response = await authAPI.getPublicServices();
          setServicios(response.data.servicios);
        } catch (error) {
          console.error('Error al cargar servicios:', error);
        }
      };
      loadServicios();
    }
  }, [rol]);

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setLoading(true);

    try {
      const { confirmarContrasena, ...registerData } = data;
      await registerUser(registerData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = process.env.NEXT_PUBLIC_API_URL + '/auth/google' || 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Selector de tipo de cuenta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de cuenta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all duration-300 ease-in-out ${
                rol === 'cliente' 
                  ? 'bg-blue-50 border-blue-500 border-2 scale-105 shadow-lg' 
                  : 'bg-white border-gray-300 hover:border-blue-300 hover:shadow-md'
              }`}>
                <input
                  {...register('rol')}
                  type="radio"
                  value="cliente"
                  className="sr-only"
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className={`block text-sm font-medium ${
                      rol === 'cliente' ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      Cliente
                    </span>
                    <span className={`mt-1 flex items-center text-sm ${
                      rol === 'cliente' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Reservar citas
                    </span>
                  </span>
                </span>
                {rol === 'cliente' && (
                  <span className="absolute top-2 right-2">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </label>

              <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all duration-300 ease-in-out ${
                rol === 'peluquero' 
                  ? 'bg-purple-50 border-purple-500 border-2 scale-105 shadow-lg' 
                  : 'bg-white border-gray-300 hover:border-purple-300 hover:shadow-md'
              }`}>
                <input
                  {...register('rol')}
                  type="radio"
                  value="peluquero"
                  className="sr-only"
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className={`block text-sm font-medium ${
                      rol === 'peluquero' ? 'text-purple-700' : 'text-gray-900'
                    }`}>
                      Peluquero
                    </span>
                    <span className={`mt-1 flex items-center text-sm ${
                      rol === 'peluquero' ? 'text-purple-600' : 'text-gray-500'
                    }`}>
                      Gestionar agenda
                    </span>
                  </span>
                </span>
                {rol === 'peluquero' && (
                  <span className="absolute top-2 right-2">
                    <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                {...register('nombre', {
                  required: 'El nombre es requerido',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                })}
                type="text"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Juan Pérez"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                type="email"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="juan@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                {...register('telefono', {
                  required: 'El teléfono es requerido',
                  pattern: {
                    value: /^\+?[0-9\s\-]+$/,
                    message: 'Teléfono inválido',
                  },
                })}
                type="tel"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+51 999 888 777"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                {...register('contrasena', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Debe contener mayúscula, minúscula y número',
                  },
                })}
                type="password"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.contrasena && (
                <p className="mt-1 text-sm text-red-600">{errors.contrasena.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                {...register('confirmarContrasena', {
                  required: 'Confirma tu contraseña',
                  validate: (value) => value === contrasena || 'Las contraseñas no coinciden',
                })}
                type="password"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.confirmarContrasena && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmarContrasena.message}</p>
              )}
            </div>

            {/* Servicios especializados (solo para peluqueros) */}
            {rol === 'peluquero' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicios especializados *
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {servicios.map((servicio) => (
                    <label key={servicio._id} className="flex items-center">
                      <input
                        {...register('serviciosEspecializados', {
                          required: rol === 'peluquero' ? 'Selecciona al menos un servicio' : false,
                        })}
                        type="checkbox"
                        value={servicio._id}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {servicio.nombre} - S/. {servicio.precio}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.serviciosEspecializados && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviciosEspecializados.message}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Tu cuenta será revisada por un administrador antes de ser activada.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">O regístrate con</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Registrarse con Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
