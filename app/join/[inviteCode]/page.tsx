import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { JoinGroupForm } from '@/components/groups/JoinGroupForm'

interface JoinGroupPageProps {
  params: Promise<{ inviteCode: string }>
}

export default async function JoinGroupPage({ params }: JoinGroupPageProps) {
  const { inviteCode } = await params

  const { data: group, error } = await supabase
    .from('groups')
    .select('id, name')
    .eq('invite_code', inviteCode)
    .single()

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-md mx-auto">
          <Link
            href="/join"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Código inválido
            </h1>
            <p className="text-gray-600 mb-6">
              El código <span className="font-mono font-bold">{inviteCode}</span> no corresponde a ningún grupo.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Verifica que el código esté bien escrito o pide a quien te lo envió que lo comparta de nuevo.
            </p>
            <Link
              href="/join"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Intentar con otro código
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/join"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </Link>

        <JoinGroupForm groupId={group.id} groupName={group.name} inviteCode={inviteCode} />
      </div>
    </div>
  )
}
