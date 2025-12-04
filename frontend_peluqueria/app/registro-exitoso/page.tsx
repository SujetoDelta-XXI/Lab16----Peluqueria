'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegistroExitosoContent() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
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
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ¡Registro Exitoso!
          </h2>

          {tipo === 'peluquero' ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-600">
                Tu solicitud de registro como peluquero ha sido enviada exitosamente.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Cuenta pendiente de aprobación</strong>
                  <br />
                  Un administrador revisará tu solicitud y te notificará cuando tu cuenta sea activada.
                  Esto puede tomar hasta 24 horas.
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Recibirás un email cuando tu cuenta sea aprobada y podrás iniciar sesión.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión y comenzar a reservar citas.
              </p>
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function RegistroExitosoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <RegistroExitosoContent />
    </Suspense>
  );
}
