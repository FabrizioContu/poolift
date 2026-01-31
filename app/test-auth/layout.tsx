// app/test-auth/layout.tsx
// Prevent static generation - this page needs runtime Supabase env vars
export const dynamic = 'force-dynamic'

export default function TestAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
