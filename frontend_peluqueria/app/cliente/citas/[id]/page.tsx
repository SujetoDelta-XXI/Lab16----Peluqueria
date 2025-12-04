'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { clientAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function CitaDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [cita, setCita] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCita();
    if (searchParams.get('action') === 'cancel') {
      setShowCancelModal(true);
    }
  }, [params.id]);

  const loadCita = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getAppointmentDetail(params.id as string);
      setCita(response.data.cita);
    } catch (error) {
      console.error('Error al cargar cita:', error);
      setError('Error al cargar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCanceling(true);
      setError('');
      await clientAPI.cancelAppointment(params.id as string, cancelReason);
      router.push('/cliente/citas?canceled=true');
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Error al cancelar la cita');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = () => {
    if (!cita || cita.estado !== 'Confirmada') return false;
    const now = new Date();
    const appointmentDate = new Date(cita.fechaHoraInicio);
    const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil >= 24;
  };

  const getStatusColor = (estado: string) => {
    const colors: Record<string, string> = {
      Confirmada: 'bg-green-100 text-green-800',
      Pendiente: 'bg-yellow-100 text-yellow-800',
      Cancelada: 'bg-red-100 text-red-800',
      Completada: 'bg-blue-100 text-blue-800',
      NoAsistio: 'bg-gray-100 text-gray-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['cliente']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!cita) {
    return (
      <ProtectedRoute allowedRoles={['cliente']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Cita no encontrada</p>
            <button
              onClick={() => router.push('/cliente/citas')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Volver a mis citas
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['cliente']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Detalle de Cita</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Hola, {user?.nombre}</span>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-700">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/cliente/citas')}
            className="mb-6 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a mis citas
          </button>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {cita.servicioId?.nombre}
              </h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  cita.estado
                )}`}
              >
                {cita.estado}
              </span>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Fecha y Hora */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Fecha y Hora</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-900">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(cita.fechaHoraInicio)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatTime(cita.fechaHoraInicio)}
                  </div>
                </div>
              </div>

              {/* Peluquero */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Peluquero</h3>
                <p className="text-gray-900">{cita.peluqueroId?.nombre}</p>
                <p className="text-sm text-gray-600">{cita.peluqueroId?.email}</p>
              </div>

              {/* Servicio */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Servicio</h3>
                <p className="text-gray-900">{cita.servicioId?.nombre}</p>
                {cita.servicioId?.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{cita.servicioId.descripcion}</p>
                )}
                <div className="mt-2 flex gap-4 text-sm text-gray-600">
                  <span>Duración: {cita.servicioId?.duracionMinutos} min</span>
                  <span>Categoría: {cita.servicioId?.categoria}</span>
                </div>
              </div>

              {/* Notas */}
              {cita.notasCliente && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notas</h3>
                  <p className="text-gray-900">{cita.notasCliente}</p>
                </div>
              )}

              {/* Precio */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    S/. {cita.precioTotal}
                  </span>
                </div>
              </div>

              {/* Información de cancelación */}
              {cita.estado === 'Cancelada' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Cita Cancelada</h3>
                  {cita.motivoCancelacion && (
                    <p className="text-sm text-red-700">Motivo: {cita.motivoCancelacion}</p>
                  )}
                  {cita.fechaCancelacion && (
                    <p className="text-sm text-red-700 mt-1">
                      Fecha de cancelación: {formatDate(cita.fechaCancelacion)}
                    </p>
                  )}
                </div>
              )}

              {/* Botón de cancelar */}
              {canCancel() && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Cancelar Cita
                </button>
              )}

              {cita.estado === 'Confirmada' && !canCancel() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">
                    No se puede cancelar esta cita (faltan menos de 24 horas)
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cancelar Cita
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de cancelación (opcional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Tengo un compromiso urgente..."
                />
              </div>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={canceling}
                >
                  No, mantener cita
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={canceling}
                >
                  {canceling ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}


export default function CitaDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CitaDetailContent />
    </Suspense>
  );
}
