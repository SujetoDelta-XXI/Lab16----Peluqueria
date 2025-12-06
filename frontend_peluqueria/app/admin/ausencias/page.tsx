'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { API as api } from '@/lib/api';

export default function AdminAbsencesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AbsencesContent />
    </ProtectedRoute>
  );
}

function AbsencesContent() {
  const router = useRouter();
  const [absences, setAbsences] = useState<any[]>([]);
  const [hairstylists, setHairstylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<any>(null);
  const [formData, setFormData] = useState({
    peluqueroId: '',
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
    descripcion: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [absencesRes, hsRes] = await Promise.all([
        api.admin.getAbsences(),
        api.admin.getHairstylists('activo')
      ]);
      setAbsences(absencesRes.data.ausencias);
      setHairstylists(hsRes.data.peluqueros);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (absence?: any) => {
    if (absence) {
      setEditingAbsence(absence);
      // Handle both populated and non-populated peluqueroId
      const peluqueroId = typeof absence.peluqueroId === 'string' 
        ? absence.peluqueroId 
        : absence.peluqueroId?._id || '';
      
      setFormData({
        peluqueroId,
        fechaInicio: absence.fechaInicio.split('T')[0],
        fechaFin: absence.fechaFin.split('T')[0],
        motivo: absence.motivo || '',
        descripcion: absence.descripcion || ''
      });
    } else {
      setEditingAbsence(null);
      setFormData({ peluqueroId: '', fechaInicio: '', fechaFin: '', motivo: '', descripcion: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAbsence) {
        await api.admin.updateAbsence(editingAbsence._id, formData);
      } else {
        await api.admin.createAbsence(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta ausencia?')) return;
    try {
      await api.admin.deleteAbsence(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar');
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Ausencias</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nueva Ausencia
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Fin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {absences.map((absence) => (
                  <tr key={absence._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {absence.peluqueroId?.usuarioId?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(absence.fechaInicio).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(absence.fechaFin).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{absence.motivo || '-'}</div>
                      {absence.descripcion && (
                        <div className="text-sm text-gray-500">{absence.descripcion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(absence)} className="text-blue-600 hover:text-blue-900 mr-3">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(absence._id)} className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingAbsence ? 'Editar Ausencia' : 'Nueva Ausencia'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peluquero *</label>
                <select
                  required
                  value={formData.peluqueroId}
                  onChange={(e) => setFormData({ ...formData, peluqueroId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {hairstylists.map((hs) => (
                    <option key={hs._id} value={hs._id}>
                      {hs.usuarioId?.nombre || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                <input
                  type="date"
                  required
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
                <input
                  type="date"
                  required
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                <select
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar motivo...</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Enfermedad">Enfermedad</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Detalles adicionales (opcional)"
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAbsence ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
