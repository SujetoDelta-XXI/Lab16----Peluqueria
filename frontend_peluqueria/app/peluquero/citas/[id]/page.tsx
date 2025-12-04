'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { API as api } from '@/lib/api';

export default function HairstylistAppointmentDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['peluquero']}>
      <AppointmentDetailContent />
    </ProtectedRoute>
  );
}

function AppointmentDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointmentDetail();
  }, [params.id]);

  const loadAppointmentDetail = async () => {
    try {
      const response = await api.hairstylist.getAppointmentDetail(params.id as string);
      setAppointment(response.data.cita);
      setClientHistory(response.data.historialCliente || []);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('Error al cargar la cita');
      router.push('/peluquero/agenda');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (action: 'complete' | 'no-show') => {
    try {
      if (action === 'complete') {
        await api.hairstylist.completeAppointment(params.id as string);
      } else {
        if (!confirm('¿Está seguro de marcar esta cita como no asistió?')) {
          return;
        }
        await api.hairstylist.markNoShow(params.id as string);
      }
      loadAppointmentDetail(); // Reload
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/peluquero/agenda')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Volver a Agenda
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Detalles de la Cita</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.estado)}`}>
                  {appointment.estado}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Servicio</label>
                  <p className="text-lg font-semibold text-gray-900">{appointment.servicioId?.nombre}</p>
                  <p className="text-sm text-gray-600">{appointment.servicioId?.categoria}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha</label>
                    <p className="text-gray-900">{formatDate(appointment.fechaHoraInicio)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hora</label>
                    <p className="text-gray-900">
                      {formatTime(appointment.fechaHoraInicio)} - {formatTime(appointment.fechaHoraFin)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duración</label>
                    <p className="text-gray-900">{appointment.servicioId?.duracionMinutos} minutos</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Precio</label>
                    <p className="text-gray-900 font-semibold">S/. {appointment.precioTotal}</p>
                  </div>
                </div>

                {appointment.notas && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notas del Cliente</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">{appointment.notas}</p>
                  </div>
                )}

                {appointment.motivoCancelacion && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Motivo de Cancelación</label>
                    <p className="text-gray-900 bg-red-50 p-3 rounded-lg mt-1">{appointment.motivoCancelacion}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {(appointment.estado === 'Confirmada' || appointment.estado === 'Pendiente') && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusUpdate('complete')}
                      className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✓ Marcar como Completada
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('no-show')}
                      className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      ✗ No Asistió
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Client History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Historial del Cliente</h2>
              </div>

              <div className="p-6">
                {clientHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Primera visita del cliente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {clientHistory.map((cita) => (
                      <div
                        key={cita._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{cita.servicioId?.nombre}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(cita.fechaHoraInicio)} - {formatTime(cita.fechaHoraInicio)}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cita.estado)}`}>
                            {cita.estado}
                          </span>
                        </div>
                        {cita.notas && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            Notas: {cita.notas}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Client Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Información del Cliente</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-gray-900 font-medium">{appointment.clienteId?.nombre}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{appointment.clienteId?.email}</p>
                </div>

                {appointment.clienteId?.telefono && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-gray-900">{appointment.clienteId.telefono}</p>
                  </div>
                )}

                {appointment.clienteId?.preferencias && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferencias</label>
                    <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg mt-1">
                      {appointment.clienteId.preferencias}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500">Total de Citas</label>
                  <p className="text-2xl font-bold text-blue-600">{clientHistory.length + 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
