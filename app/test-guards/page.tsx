// app/test-guards/page.tsx
'use client'

import { useState } from 'react'
import { AccessGuard } from '@/components/auth/AccessGuard'
import { SpoilerGuard } from '@/components/auth/SpoilerGuard'
import { anonymousStorage } from '@/lib/storage'

export default function TestGuardsPage() {
  const [testGroupId] = useState('test-group-123')
  const [testCelebrants] = useState(['Juan Garcia', 'Maria Lopez'])
  const [showAccessTest, setShowAccessTest] = useState(false)
  const [showSpoilerTest, setShowSpoilerTest] = useState(false)
  const [, forceUpdate] = useState(0)

  const grantAccess = () => {
    anonymousStorage.addGroup(testGroupId)
    forceUpdate((n) => n + 1)
    alert('Acceso concedido a test-group-123')
  }

  const revokeAccess = () => {
    anonymousStorage.removeGroup(testGroupId)
    forceUpdate((n) => n + 1)
    alert('Acceso revocado de test-group-123')
  }

  const setTestName = (name: string) => {
    anonymousStorage.setUserName(name)
    forceUpdate((n) => n + 1)
    alert(`Nombre configurado: ${name}`)
  }

  const clearName = () => {
    anonymousStorage.setUserName('')
    forceUpdate((n) => n + 1)
    alert('Nombre borrado')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Guards Test Page</h1>

      {/* AccessGuard Test */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">1. AccessGuard Test</h2>

        <div className="space-y-3 mb-4">
          <button
            onClick={grantAccess}
            className="px-4 py-2 bg-green-500 text-white rounded mr-2"
          >
            Conceder Acceso
          </button>

          <button
            onClick={revokeAccess}
            className="px-4 py-2 bg-red-500 text-white rounded mr-2"
          >
            Revocar Acceso
          </button>

          <button
            onClick={() => setShowAccessTest(!showAccessTest)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {showAccessTest ? 'Ocultar' : 'Mostrar'} AccessGuard
          </button>
        </div>

        {showAccessTest && (
          <AccessGuard groupId={testGroupId}>
            <div className="p-4 bg-green-50 border border-green-300 rounded">
              Tienes acceso! Este contenido solo es visible si tienes permiso.
            </div>
          </AccessGuard>
        )}

        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <strong>Instrucciones:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click &quot;Mostrar AccessGuard&quot; sin acceso - Debe redirigir a home</li>
            <li>Click &quot;Conceder Acceso&quot;</li>
            <li>Click &quot;Mostrar AccessGuard&quot; - Debe mostrar contenido verde</li>
            <li>Click &quot;Revocar Acceso&quot; - Debe redirigir a home</li>
          </ol>
        </div>
      </div>

      {/* SpoilerGuard Test */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">2. SpoilerGuard Test</h2>

        <div className="space-y-3 mb-4">
          <button
            onClick={() => setTestName('Juan Garcia')}
            className="px-4 py-2 bg-yellow-500 text-white rounded mr-2"
          >
            Nombre: Juan Garcia (celebrante)
          </button>

          <button
            onClick={() => setTestName('Pedro Sanchez')}
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          >
            Nombre: Pedro Sanchez (no celebrante)
          </button>

          <button
            onClick={clearName}
            className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
          >
            Borrar Nombre
          </button>

          <button
            onClick={() => setShowSpoilerTest(!showSpoilerTest)}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            {showSpoilerTest ? 'Ocultar' : 'Mostrar'} SpoilerGuard
          </button>
        </div>

        {showSpoilerTest && (
          <SpoilerGuard celebrantNames={testCelebrants}>
            <div className="p-4 bg-blue-50 border border-blue-300 rounded">
              No eres celebrante! Puedes ver el regalo.
              <div className="mt-2 text-sm">
                Celebrantes: {testCelebrants.join(', ')}
              </div>
            </div>
          </SpoilerGuard>
        )}

        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <strong>Instrucciones:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click &quot;Nombre: Juan Garcia&quot; (es celebrante)</li>
            <li>Click &quot;Mostrar SpoilerGuard&quot; - Debe bloquear con mensaje spoiler</li>
            <li>Click &quot;No soy Juan Garcia&quot;</li>
            <li>Click &quot;Nombre: Pedro Sanchez&quot; (no es celebrante)</li>
            <li>Click &quot;Mostrar SpoilerGuard&quot; - Debe mostrar contenido azul</li>
          </ol>
        </div>
      </div>

      {/* Estado Actual */}
      <div className="p-6 bg-gray-50 border rounded-lg">
        <h3 className="font-bold mb-2 text-gray-900">Estado Actual:</h3>
        <pre className="text-sm bg-white p-3 rounded overflow-auto">
{JSON.stringify({
  myGroups: anonymousStorage.getMyGroups(),
  userName: anonymousStorage.getUserName(),
  hasAccessToTest: anonymousStorage.hasAccess(testGroupId)
}, null, 2)}
        </pre>
      </div>
    </div>
  )
}
