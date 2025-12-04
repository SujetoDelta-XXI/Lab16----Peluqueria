'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Servicios',
      description: 'Gestionar servicios disponibles',
      icon: '✂️',
      path: '/admin/servicios',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Peluqueros',
      description: 'Gestionar peluqueros y aprobaciones',
      icon: '👨‍💼',
      path: '/admin/peluqueros',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Ausencias',
      description: 'Gestionar ausencias de peluqueros',
      icon: '📅',
      path: '/admin/ausencias',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Citas',
      description: 'Ver y gestionar todas las citas',
      icon: '📋',
      path: '/admin/citas',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Clientes',
      description: 'Gestionar clientes registrados',
      icon: '👥',
      path: '/admin/clientes',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      title: 'Configuración',
      description: 'Configuración del negocio',
      icon: '⚙️',
      path: '/admin/configuracion',
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">{user?.nombre}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bienvenido al Panel de Administración
          </h2>
          <p className="text-gray-600">
            Gestiona todos los aspectos de tu negocio desde aquí.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className={`w-16 h-16 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                <span className="text-3xl">{item.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
