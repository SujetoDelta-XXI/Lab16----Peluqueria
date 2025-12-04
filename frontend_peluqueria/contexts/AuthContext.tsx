'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'cliente' | 'peluquero' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error al cargar usuario:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, contrasena: string) => {
    try {
      const response = await authAPI.login({ email, contrasena });
      const { user: userData, token, redirectUrl } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      // Redirigir según el rol
      router.push(redirectUrl);
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Error al iniciar sesión';
      throw new Error(message);
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data);
      const { user: userData, token, redirectUrl, requiresApproval } = response.data;

      // Si requiere aprobación (peluquero), redirigir a página de éxito
      if (requiresApproval) {
        router.push('/registro-exitoso?tipo=peluquero');
        return;
      }

      // Si es cliente, se activa inmediatamente
      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        router.push(redirectUrl || '/cliente/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Error al registrarse';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
