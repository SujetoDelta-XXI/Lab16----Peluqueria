'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { clientAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'upcoming' | 'history';

function CitasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCitas();
  }, [activeTab]);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getAppointments(activeTab);
      setCitas(response.data.citas);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (citaId: string) => {
    router.push(`/cliente/citas/${citaId}?action=cancel`);
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

  const canCancel = (fechaHoraInicio: string) => {
    const now = new Date();
    const appointmentDate = new Date(fechaHoraInicio);
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

  return (
    <ProtectedRoute allowedRoles={['cliente']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Hola, {user?.nombre}</span>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-700">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => router.push('/cliente/dashboard')}
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Inicio
              </button>
              <button
                onClick={() => router.push('/cliente/reservar')}
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Reservar Cita
              </button>
              <button
                onClick={() => router.push('/cliente/citas')}
                className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
              >
                Mis Citas
              </button>
              <button
                onClick={() => router.push('/cliente/perfil')}
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Mi Perfil
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="ml-3 text-sm text-green-800">
                  ¡Cita reservada exitosamente!
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'upcoming'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Próximas Citas
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Historial
                </button>
              </nav>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : citas.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-gray-600">
                    {activeTab === 'upcoming'
                      ? 'No tienes citas próximas'
                      : 'No tienes citas en el historial'}
                  </p>
                  {activeTab === 'upcoming' && (
                    <button
                      onClick={() => router.push('/cliente/reservar')}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Reservar una cita
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {citas.map((cita) => (
                    <div
                      key={cita._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {cita.servicioId?.nombre}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Con: {cita.peluqueroId?.nombre}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                cita.estado
                              )}`}
                            >
                              {cita.estado}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {formatDate(cita.fechaHoraInicio)}
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
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

                          {cita.notasCliente && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              Notas: {cita.notasCliente}
                            </p>
                          )}
                        </div>

                        <div className="ml-4 text-right">
                          <p className="text-lg font-bold text-gray-900">
                            S/. {cita.precioTotal}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => router.push(`/cliente/citas/${cita._id}`)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Ver Detalle
                        </button>
                        {activeTab === 'upcoming' &&
                          cita.estado === 'Confirmada' &&
                          canCancel(cita.fechaHoraInicio) && (
                            <button
                              onClick={() => handleCancelClick(cita._id)}
                              className="flex-1 px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                              Cancelar Cita
                            </button>
                          )}
                      </div>

                      {activeTab === 'upcoming' &&
                        cita.estado === 'Confirmada' &&
                        !canCancel(cita.fechaHoraInicio) && (
                          <p className="mt-2 text-xs text-gray-500 text-center">
                            No se puede cancelar (menos de 24 horas)
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function CitasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CitasContent />
    </Suspense>
  );
}
