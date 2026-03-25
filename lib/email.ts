import { Resend } from 'resend'

const FROM = 'Poolift <notificaciones@poolift.vercel.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://poolift.vercel.app'

// Internal helper — never throws, logs errors only
async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return // silent skip in dev/test
  const resend = new Resend(process.env.RESEND_API_KEY)
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
  const html = `<pre style="font-family:sans-serif;white-space:pre-wrap;font-size:14px;line-height:1.6">${escaped}</pre>`
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) console.error('[email] Send failed:', error)
  } catch (err) {
    console.error('[email] Unexpected error:', err)
  }
}

// ── Direct gift: notify organizer when someone joins ─────────────────────────

export async function notifyOrganizerJoined(opts: {
  organizerEmail: string
  participantName: string
  recipientName: string
  shareCode: string
}): Promise<void> {
  const text = `👥 ${opts.participantName} se ha apuntado al regalo de ${opts.recipientName}.\n\nVer regalo: ${APP_URL}/gifts/${opts.shareCode}`
  await sendEmail(
    opts.organizerEmail,
    `${opts.participantName} se apuntó al regalo de ${opts.recipientName}`,
    text,
  )
}

// ── Direct gift: notify organizer when someone declines ──────────────────────

export async function notifyOrganizerDeclined(opts: {
  organizerEmail: string
  participantName: string
  recipientName: string
  shareCode: string
}): Promise<void> {
  const text = `❌ ${opts.participantName} no podrá participar en el regalo de ${opts.recipientName}.\n\nVer regalo: ${APP_URL}/gifts/${opts.shareCode}`
  await sendEmail(
    opts.organizerEmail,
    `${opts.participantName} declinó el regalo de ${opts.recipientName}`,
    text,
  )
}

// ── Notify joined participants when participation closes ─────────────────────

export async function notifyParticipantsClosed(opts: {
  emails: string[]
  recipientName: string
  giftIdea: string | null
  pricePerParticipant: number
  participantCount: number
  shareCode: string
}): Promise<void> {
  const text = [
    `🔒 Participación cerrada — Regalo de ${opts.recipientName}`,
    '',
    opts.giftIdea ? `🎁 ${opts.giftIdea}` : null,
    `💰 Precio por persona: ${opts.pricePerParticipant.toFixed(2)}€`,
    `👥 ${opts.participantCount} participantes`,
    '',
    `Ver detalles: ${APP_URL}/gifts/${opts.shareCode}`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  for (const email of opts.emails) {
    await sendEmail(email, `Participación cerrada — regalo de ${opts.recipientName}`, text)
  }
}

// ── Notify joined participants when gift is finalized/purchased ──────────────

export async function notifyParticipantsFinalized(opts: {
  emails: string[]
  recipientName: string
  giftIdea: string | null
  finalPrice: number
  pricePerParticipant: number
  organizerComment: string | null
  shareCode: string
}): Promise<void> {
  const text = [
    `🎉 ¡Regalo comprado! — ${opts.recipientName}`,
    '',
    opts.giftIdea ? `🎁 ${opts.giftIdea}` : null,
    `💰 Precio final: ${opts.finalPrice.toFixed(2)}€`,
    `👥 Por persona: ${opts.pricePerParticipant.toFixed(2)}€`,
    opts.organizerComment ? `\n📝 ${opts.organizerComment}` : null,
    '',
    `Ver detalles: ${APP_URL}/gifts/${opts.shareCode}`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  for (const email of opts.emails) {
    await sendEmail(email, `¡El regalo de ${opts.recipientName} está comprado!`, text)
  }
}
