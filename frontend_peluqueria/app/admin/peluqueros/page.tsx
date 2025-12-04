'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { API as api } from '@/lib/api';

export default function AdminHairstylistsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <HairstylistsContent />
    </ProtectedRoute>
  );
}

function HairstylistsContent() {
  const router = useRouter();
  const [hairstylists, setHairstylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'activo' | 'inactivo'>('todos');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const response = await api.admin.getHairstylists(filter === 'todos' ? undefined : filter);
      setHairstylists(response.data.peluqueros);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.admin.approveHairstylist(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al aprobar');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('¿Desactivar este peluquero?')) return;
    try {
      await api.admin.deactivateHairstylist(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al desactivar');
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await api.admin.reactivateHairstylist(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al reactivar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este peluquero? Esta acción no se puede deshacer.')) return;
    try {
      await api.admin.deleteHairstylist(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const getStatusBadge = (estado: string) => {
    const badges: Record<string, string> = {
      activo: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      inactivo: 'bg-red-100 text-red-800'
    };
    return badges[estado] || badges.pendiente;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin/dashboard')} className="text-gray-600 hover:text-gray-900">
                ← Volver
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Peluqueros</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            {(['todos', 'pendiente', 'activo', 'inactivo'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peluquero</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicios</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hairstylists.map((hs) => (
                  <tr key={hs._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{hs.usuarioId?.nombre || hs.nombre || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-500">{hs.usuarioId?.email || hs.email || 'Sin email'}</div>
                      {hs.usuarioId?.telefono && <div className="text-sm text-gray-500">{hs.usuarioId.telefono}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {hs.serviciosEspecializados?.filter((s: any) => s && s.nombre).map((s: any) => (
                          <span key={s._id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {s.nombre}
                          </span>
                        )) || <span className="text-sm text-gray-500">Sin servicios</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(hs.estado)}`}>
                        {hs.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {hs.estado === 'pendiente' && (
                          <button onClick={() => handleApprove(hs._id)} className="text-green-600 hover:text-green-900">
                            Aprobar
                          </button>
                        )}
                        {hs.estado === 'activo' && (
                          <button onClick={() => handleDeactivate(hs._id)} className="text-yellow-600 hover:text-yellow-900">
                            Desactivar
                          </button>
                        )}
                        {hs.estado === 'inactivo' && (
                          <button onClick={() => handleReactivate(hs._id)} className="text-green-600 hover:text-green-900">
                            Reactivar
                          </button>
                        )}
                        <button onClick={() => handleDelete(hs._id)} className="text-red-600 hover:text-red-900">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
