'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { clientAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'service' | 'hairstylist' | 'datetime' | 'confirm';

interface TimeSlot {
  inicio: string;
  fin: string;
}

export default function ReservarPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data
  const [servicios, setServicios] = useState<any[]>([]);
  const [peluqueros, setPeluqueros] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Selection
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedHairstylist, setSelectedHairstylist] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getServices();
      setServicios(response.data.servicios);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setError('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const loadPeluqueros = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await clientAPI.getHairstylists(serviceId);
      setPeluqueros(response.data.peluqueros);
    } catch (error) {
      console.error('Error al cargar peluqueros:', error);
      setError('Error al cargar peluqueros');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (hairstylistId: string, date: string, serviceId: string) => {
    try {
      setLoading(true);
      const response = await clientAPI.getAvailability(hairstylistId, date, serviceId);
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      setError('Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = async (service: any) => {
    setSelectedService(service);
    await loadPeluqueros(service._id);
    setCurrentStep('hairstylist');
  };

  const handleHairstylistSelect = (hairstylist: any) => {
    setSelectedHairstylist(hairstylist);
    setCurrentStep('datetime');
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (selectedHairstylist && selectedService) {
      await loadAvailability(selectedHairstylist._id, date, selectedService._id);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      const fechaHoraInicio = new Date(`${selectedDate}T${selectedTime}`).toISOString();

      await clientAPI.createAppointment({
        peluqueroId: selectedHairstylist._id,
        servicioId: selectedService._id,
        fechaHoraInicio,
        notasCliente: notes,
      });

      router.push('/cliente/citas?success=true');
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    const steps: Step[] = ['service', 'hairstylist', 'datetime', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <ProtectedRoute allowedRoles={['cliente']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Reservar Cita</h1>
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
              {[
                { path: '/cliente/dashboard', label: 'Inicio', active: false },
                { path: '/cliente/reservar', label: 'Reservar Cita', active: true },
                { path: '/cliente/citas', label: 'Mis Citas', active: false },
                { path: '/cliente/perfil', label: 'Mi Perfil', active: false },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`border-b-2 ${
                    item.active
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } py-4 px-1 text-sm font-medium`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { key: 'service', label: 'Servicio' },
                { key: 'hairstylist', label: 'Peluquero' },
                { key: 'datetime', label: 'Fecha y Hora' },
                { key: 'confirm', label: 'Confirmar' },
              ].map((step, index) => {
                const steps: Step[] = ['service', 'hairstylist', 'datetime', 'confirm'];
                const currentStepIndex = steps.indexOf(currentStep);
                
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentStep === step.key
                            ? 'bg-blue-600 text-white'
                            : index < currentStepIndex
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">{step.label}</span>
                    </div>
                    {index < 3 && (
                      <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Step 1: Select Service */}
            {currentStep === 'service' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Selecciona un servicio
                </h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicios.map((servicio) => (
                      <button
                        key={servicio._id}
                        onClick={() => handleServiceSelect(servicio)}
                        className="text-left border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900">{servicio.nombre}</h3>
                        <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-gray-500">
                            {servicio.duracionMinutos} min
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            S/. {servicio.precio}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Hairstylist */}
            {currentStep === 'hairstylist' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Selecciona un peluquero
                </h2>
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Servicio seleccionado: <strong>{selectedService?.nombre}</strong>
                  </p>
                </div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : peluqueros.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">
                    No hay peluqueros disponibles para este servicio
                  </p>
                ) : (
                  <div className="space-y-3">
                    {peluqueros.map((peluquero) => (
                      <button
                        key={peluquero._id}
                        onClick={() => handleHairstylistSelect(peluquero)}
                        className="w-full text-left border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900">{peluquero.nombre}</h3>
                        <p className="text-sm text-gray-600 mt-1">{peluquero.email}</p>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={goBack}
                  className="mt-6 text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Cambiar servicio
                </button>
              </div>
            )}

            {/* Step 3: Select Date and Time */}
            {currentStep === 'datetime' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Selecciona fecha y hora
                </h2>
                <div className="mb-4 p-3 bg-blue-50 rounded-md space-y-1">
                  <p className="text-sm text-blue-800">
                    Servicio: <strong>{selectedService?.nombre}</strong>
                  </p>
                  <p className="text-sm text-blue-800">
                    Peluquero: <strong>{selectedHairstylist?.nombre}</strong>
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horarios disponibles
                    </label>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-center text-gray-600 py-8">
                        No hay horarios disponibles para esta fecha
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot, index) => {
                          const slotInicio = typeof slot === 'string' ? slot : slot.inicio;
                          const slotFin = typeof slot === 'string' ? '' : slot.fin;
                          const displayText = slotFin ? `${slotInicio} - ${slotFin}` : slotInicio;
                          return (
                            <button
                              key={`${slotInicio}-${index}`}
                              onClick={() => handleTimeSelect(slotInicio)}
                              className="px-4 py-2 border-2 border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm text-gray-900"
                            >
                              {displayText}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={goBack}
                  className="mt-6 text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Cambiar peluquero
                </button>
              </div>
            )}

            {/* Step 4: Confirm */}
            {currentStep === 'confirm' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Confirmar reserva
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-900">Servicio:</span>
                    <span className="text-gray-900">{selectedService?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Peluquero:</span>
                    <span className="text-gray-900">{selectedHairstylist?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Fecha:</span>
                    <span className="text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Hora:</span>
                    <span className="text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Duración:</span>
                    <span className="text-gray-900">{selectedService?.duracionMinutos} min</span>
                  </div>
                  <div className="flex justify-between text-lg pt-3 border-t">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">S/. {selectedService?.precio}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Quiero un corte moderno, puntas claras..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={goBack}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
