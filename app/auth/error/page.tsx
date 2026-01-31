// app/auth/error/page.tsx
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">!</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Error de autenticación
        </h1>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error durante el proceso de autenticación. Por favor,
          intenta de nuevo.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
