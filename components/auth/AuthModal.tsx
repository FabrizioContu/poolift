'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Mail } from 'lucide-react'
import { signIn, signUp } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { migrateAnonData } from '@/lib/migrate'

// --- Schemas ---

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email no valido'),
  password: z
    .string()
    .min(6, 'La contrasena debe tener al menos 6 caracteres'),
})

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener mas de 50 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email no valido'),
  password: z
    .string()
    .min(6, 'La contrasena debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

// --- Error mapping ---

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Email o contrasena incorrectos'
  }
  if (message.includes('User already registered')) {
    return 'Este email ya esta registrado. Prueba a iniciar sesion.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Debes confirmar tu email antes de iniciar sesion'
  }
  if (message.includes('Password should be at least')) {
    return 'La contrasena debe tener al menos 6 caracteres'
  }
  return message
}

// --- Props ---

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultTab?: 'login' | 'register'
  headline?: string
  subheadline?: string
}

// --- Component ---

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login',
  headline,
  subheadline,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setIsSubmitting(false)
      setShowConfirmation(false)
      setActiveTab(defaultTab)
      loginForm.reset()
      registerForm.reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultTab])

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    setError(null)
  }

  const handleLogin = async (data: LoginFormData) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const { error: authError } = await signIn(data.email, data.password)
      if (authError) {
        setError(mapAuthError(authError.message))
        return
      }
      await migrateAnonData()
      onSuccess?.()
      onClose()
    } catch {
      setError('Error al iniciar sesion')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (data: RegisterFormData) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const { data: authData, error: authError } = await signUp(
        data.email,
        data.password,
        data.name
      )
      if (authError) {
        setError(mapAuthError(authError.message))
        return
      }
      // Email confirmation required
      if (authData.user && !authData.session) {
        setShowConfirmation(true)
        return
      }
      // Auto-confirmed (e.g. development)
      await migrateAnonData()
      onSuccess?.()
      onClose()
    } catch {
      setError('Error al crear cuenta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
        },
      })
      if (oauthError) {
        setError(mapAuthError(oauthError.message))
      }
    } catch {
      setError('Error al conectar con Google')
    }
  }

  const tabClass = (tab: 'login' | 'register') =>
    `py-3 px-1 border-b-2 font-medium text-sm transition ${
      activeTab === tab
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`

  const title = activeTab === 'login' ? 'Iniciar sesion' : 'Crear cuenta'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {/* Headline (para nudge en Phase 2) */}
      {headline && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800">{headline}</p>
          {subheadline && (
            <p className="text-xs text-blue-600 mt-1">{subheadline}</p>
          )}
        </div>
      )}

      {/* Email confirmation view */}
      {showConfirmation ? (
        <div className="text-center space-y-4 py-4">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Mail size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Revisa tu email
          </h3>
          <p className="text-gray-600 text-sm">
            Hemos enviado un enlace de confirmacion a tu email. Haz clic en el
            enlace para activar tu cuenta.
          </p>
          <Button variant="secondary" onClick={onClose} className="w-full">
            Entendido
          </Button>
        </div>
      ) : (
        <>
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex gap-4" aria-label="Tabs">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={tabClass('login')}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                className={tabClass('register')}
              >
                Crear cuenta
              </button>
            </nav>
          </div>

          {/* Login form */}
          {activeTab === 'login' && (
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-4"
            >
              <Input
                label="Email"
                type="email"
                required
                placeholder="tu@email.com"
                disabled={isSubmitting}
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <Input
                label="Contrasena"
                type="password"
                required
                disabled={isSubmitting}
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />
              {error && <Alert variant="error">{error}</Alert>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          )}

          {/* Register form */}
          {activeTab === 'register' && (
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-4"
            >
              <Input
                label="Nombre"
                required
                placeholder="ej: Maria"
                disabled={isSubmitting}
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register('name')}
              />
              <Input
                label="Email"
                type="email"
                required
                placeholder="tu@email.com"
                disabled={isSubmitting}
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
              />
              <Input
                label="Contrasena"
                type="password"
                required
                disabled={isSubmitting}
                error={registerForm.formState.errors.password?.message}
                {...registerForm.register('password')}
              />
              {error && <Alert variant="error">{error}</Alert>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">o</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google
          </button>
        </>
      )}
    </Modal>
  )
}
