'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { API as api } from '@/lib/api';

export default function HairstylistAgendaPage() {
  return (
    <ProtectedRoute allowedRoles={['peluquero']}>
      <AgendaContent />
    </ProtectedRoute>
  );
}

function AgendaContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAgenda();
  }, [view, selectedDate]);

  const loadAgenda = async () => {
    setLoading(true);
    try {
      const response = await api.hairstylist.getAgenda(selectedDate, view);
      setAppointments(response.data.citas);
    } catch (error) {
      console.error('Error al cargar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, action: 'complete' | 'no-show') => {
    try {
      if (action === 'complete') {
        await api.hairstylist.completeAppointment(appointmentId);
      } else {
        await api.hairstylist.markNoShow(appointmentId);
      }
      loadAgenda(); // Reload
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al actualizar la cita');
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

  const getStatusColor = (estado: string) => {
    const colors: Record<string, string> = {
      Confirmada: 'bg-green-100 text-green-800',
      Pendiente: 'bg-yellow-100 text-yellow-800',
      Completada: 'bg-blue-100 text-blue-800',
      Cancelada: 'bg-red-100 text-red-800',
      NoAsistio: 'bg-gray-100 text-gray-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Agenda</h1>
              <p className="text-sm text-gray-600">{user?.nombre}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/peluquero/perfil')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Mi Perfil
              </button>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 text-sm font-medium ${
                  view === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 text-sm font-medium border-l ${
                  view === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Semana
              </button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeDate(view === 'day' ? -1 : -7)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => changeDate(view === 'day' ? 1 : 7)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {view === 'day' ? formatDate(selectedDate) : `Semana del ${formatDate(selectedDate)}`}
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : appointments.length === 0 ? (
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
                <p className="mt-2 text-sm text-gray-600">
                  No hay citas programadas para este período
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((cita) => (
                  <div
                    key={cita._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {formatTime(cita.fechaHoraInicio)} - {formatTime(cita.fechaHoraFin)}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cita.estado)}`}>
                            {cita.estado}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Cliente: <span className="font-medium">{cita.clienteId?.nombre}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Servicio: <span className="font-medium">{cita.servicioId?.nombre}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Duración: {cita.servicioId?.duracionMinutos} min | Precio: S/. {cita.precioTotal}
                        </p>
                        {cita.notas && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            Notas: {cita.notas}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => router.push(`/peluquero/citas/${cita._id}`)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Ver Detalle
                      </button>
                      
                      {(cita.estado === 'Confirmada' || cita.estado === 'Pendiente') && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(cita._id, 'complete')}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Marcar como no asistió?')) {
                                handleStatusUpdate(cita._id, 'no-show');
                              }
                            }}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            No Asistió
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
