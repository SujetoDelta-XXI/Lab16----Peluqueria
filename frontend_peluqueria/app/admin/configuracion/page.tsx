'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { API as api } from '@/lib/api';

export default function AdminConfigPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ConfigContent />
    </ProtectedRoute>
  );
}

function ConfigContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [config, setConfig] = useState<any>(null);

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.admin.getConfiguration();
      setConfig(response.data.negocio);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.admin.updateConfiguration(config);
      setMessage({ type: 'success', text: 'Configuración actualizada exitosamente' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const updateHorario = (dia: string, field: string, value: any) => {
    const currentDia = config.horarioOperacion?.[dia] || {};
    
    // Si se está activando el día y no tiene horarios, inicializar con valores por defecto
    if (field === 'cerrado' && value === false && !currentDia.apertura) {
      setConfig({
        ...config,
        horarioOperacion: {
          ...config.horarioOperacion,
          [dia]: {
            cerrado: false,
            apertura: '09:00',
            cierre: '18:00'
          }
        }
      });
    } else {
      setConfig({
        ...config,
        horarioOperacion: {
          ...config.horarioOperacion,
          [dia]: {
            ...currentDia,
            [field]: value
          }
        }
      });
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/dashboard')} className="text-gray-600 hover:text-gray-900">
              ← Volver
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Configuración del Negocio</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                <input
                  type="text"
                  required
                  value={config.nombre || ''}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Buffer (minutos)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5"
                  value={config.tiempoBufferMinutos || 15}
                  onChange={(e) => setConfig({ ...config, tiempoBufferMinutos: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Tiempo adicional entre citas para limpieza y preparación
                </p>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Horario de Operación</h2>
            <div className="space-y-3">
              {dias.map((dia) => (
                <div key={dia} className="flex items-center gap-4">
                  <div className="w-32">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!config.horarioOperacion?.[dia]?.cerrado}
                        onChange={(e) => updateHorario(dia, 'cerrado', !e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium capitalize ${
                        config.horarioOperacion?.[dia]?.cerrado 
                          ? 'text-gray-400 line-through' 
                          : 'text-gray-700'
                      }`}>
                        {dia}
                      </span>
                    </label>
                  </div>
                  {!config.horarioOperacion?.[dia]?.cerrado ? (
                    <>
                      <div>
                        <input
                          type="time"
                          required
                          value={config.horarioOperacion[dia]?.apertura || '09:00'}
                          onChange={(e) => updateHorario(dia, 'apertura', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-gray-500">-</span>
                      <div>
                        <input
                          type="time"
                          required
                          value={config.horarioOperacion[dia]?.cierre || '18:00'}
                          onChange={(e) => updateHorario(dia, 'cierre', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-sm text-red-600 font-medium">Cerrado</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
