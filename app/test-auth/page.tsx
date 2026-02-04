// app/test-auth/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth, signUp, signIn, signOut } from '@/lib/auth'
import { anonymousStorage } from '@/lib/storage'

export default function TestAuthPage() {
  const { user, loading, isAuthenticated, isAnonymous } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    setMessage('Registrando...')
    const { error } = await signUp(email, password)
    setMessage(error ? `Error: ${error.message}` : 'Revisa tu email!')
  }

  const handleSignIn = async () => {
    setMessage('Iniciando sesión...')
    const { error } = await signIn(email, password)
    setMessage(error ? `Error: ${error.message}` : 'Sesión iniciada!')
  }

  const handleSignOut = async () => {
    await signOut()
    setMessage('Sesión cerrada')
  }

  const testAnonymousStorage = () => {
    anonymousStorage.addGroup('test-group-123')
    anonymousStorage.setUserName('Test User')
    const data = anonymousStorage.getMigrationData()
    setMessage(`Anonymous data: ${JSON.stringify(data, null, 2)}`)
  }

  const clearAnonymousStorage = () => {
    anonymousStorage.clear()
    setMessage('Anonymous storage cleared')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Auth Test Page</h1>

      {/* Status */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <h2 className="font-bold mb-2 text-lg text-gray-900">Status:</h2>
        <div className="space-y-1">
          <p>
            <span className="font-medium">Authenticated:</span>{' '}
            {isAuthenticated ? (
              <span className="text-green-600">Yes</span>
            ) : (
              <span className="text-red-600">No</span>
            )}
          </p>
          <p>
            <span className="font-medium">Anonymous:</span>{' '}
            {isAnonymous ? (
              <span className="text-yellow-600">Yes</span>
            ) : (
              <span className="text-green-600">No</span>
            )}
          </p>
          {user && (
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">ID:</span> {user.id}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Auth Forms */}
      {isAnonymous ? (
        <div className="space-y-4 mb-8 p-4 bg-white rounded-lg border">
          <h2 className="text-xl font-bold text-gray-900">Sign In / Sign Up</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSignUp}
              disabled={!email || !password}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Up
            </button>

            <button
              onClick={handleSignIn}
              disabled={!email || !password}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-white rounded-lg border">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Authenticated</h2>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Anonymous Storage Test */}
      <div className="mb-8 p-4 bg-white rounded-lg border">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Anonymous Storage Test</h2>
        <div className="flex gap-2">
          <button
            onClick={testAnonymousStorage}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Storage
          </button>
          <button
            onClick={clearAnonymousStorage}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Storage
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-8">
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2 text-gray-900">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Try signing up with a test email</li>
          <li>Check Supabase dashboard for new user</li>
          <li>Try signing in with same credentials</li>
          <li>Test anonymous storage functionality</li>
          <li>Sign out and verify state changes</li>
        </ol>
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}
