'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { API as api } from '@/lib/api';

export default function HairstylistProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['peluquero']}>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.hairstylist.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      setLoading(false);
      return;
    }

    try {
      await api.hairstylist.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al cambiar la contraseña' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      activo: { color: 'bg-green-100 text-green-800', text: 'Activo' },
      pendiente: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente de Aprobación' },
      inactivo: { color: 'bg-red-100 text-red-800', text: 'Inactivo' }
    };
    const badge = badges[estado] || badges.pendiente;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/peluquero/agenda')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Volver a Agenda
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💇</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{profile?.usuario?.nombre}</h2>
                <p className="text-sm text-gray-600 mb-3">{profile?.usuario?.email}</p>
                {profile?.peluquero && getEstadoBadge(profile.peluquero.estado)}
              </div>

              {profile?.peluquero?.estado === 'pendiente' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos cuando sea activada.
                  </p>
                </div>
              )}

              {profile?.peluquero?.estado === 'inactivo' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Tu cuenta ha sido desactivada. Contacta al administrador para más información.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => {
                      setActiveTab('info');
                      setMessage(null);
                    }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'info'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Información
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('password');
                      setMessage(null);
                    }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'password'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Cambiar Contraseña
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Message */}
                {message && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Info Tab */}
                {activeTab === 'info' && profile && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                          <p className="text-gray-900">{profile.usuario?.nombre}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{profile.usuario?.email}</p>
                        </div>
                        {profile.usuario?.telefono && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Teléfono</label>
                            <p className="text-gray-900">{profile.usuario.telefono}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {profile.peluquero && (
                      <>
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios Especializados</h3>
                          {profile.peluquero.serviciosEspecializados?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profile.peluquero.serviciosEspecializados.map((servicio: any) => (
                                <span
                                  key={servicio._id}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                  {servicio.nombre}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No hay servicios asignados</p>
                          )}
                        </div>

                        {profile.peluquero.horarioDisponible && (
                          <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Horario Disponible</h3>
                            <div className="space-y-2">
                              {Object.entries(profile.peluquero.horarioDisponible).map(([dia, horario]: [string, any]) => (
                                <div key={dia} className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="font-medium text-gray-700 capitalize">{dia}</span>
                                  {horario.disponible ? (
                                    <span className="text-gray-600">
                                      {horario.inicio} - {horario.fin}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">No disponible</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="border-t border-gray-200 pt-6">
                      <p className="text-sm text-gray-500">
                        Para actualizar tu información personal, horarios o servicios, contacta al administrador.
                      </p>
                    </div>
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual *
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tu contraseña actual"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña *
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nueva Contraseña *
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Repite la nueva contraseña"
                        minLength={6}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
