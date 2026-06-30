const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://poolift.vercel.app'

export function generateInviteMessage(
  groupName: string,
  inviteCode: string
): string {
  return `🎉 ¡Únete a nuestro grupo de regalos!

Hola! Te invito a unirte a "${groupName}" en Poolift.

Con esta app podemos organizarnos mejor para los regalos de cumpleaños de los niños. Ya no más confusiones sobre quién participa o cuánto poner 😊

👉 Únete aquí: ${APP_URL}/join/${inviteCode}

¡Nos vemos dentro!`
}

export function generatePartyInviteMessage(
  celebrants: string[],
  partyDate: string,
  groupName: string,
  inviteLink: string
): string {
  const names = celebrants.length > 0 ? celebrants.join(' y ') : 'los niños'

  return `🎉 ¡Estás invitado a la fiesta de ${names}!

Fecha: ${partyDate}

Únete al grupo "${groupName}" en Poolift para coordinar el regalo entre todas las familias. Sin registro: tu acceso se guarda con un código de familia 😊

👉 Únete aquí: ${inviteLink}`
}

export function generateParticipationMessage(
  celebrants: string[],
  partyDate: string,
  giftName: string,
  totalPrice: number,
  shareCode: string
): string {
  const names = celebrants.join(' y ')
  
  return `🎁 Regalo para ${names}

Fiesta: ${partyDate}
Regalo: ${giftName}
Precio total: ${totalPrice}€

¿Quieres participar?

👉 Apúntate aquí: ${APP_URL}/gifts/${shareCode}`
}

export function generateParticipationClosedMessage(
  celebrants: string[],
  giftName: string,
  pricePerFamily: string,
  participantCount: number,
  shareCode: string
): string {
  const names = celebrants.join(' y ')

  return `🔒 Participación cerrada

Regalo para: ${names}
🎁 ${giftName}

💰 Precio por familia: ${pricePerFamily}€
👥 ${participantCount} familias participantes

👉 Ver detalles: ${APP_URL}/gifts/${shareCode}`
}

export function generateCompletionMessage(
  celebrants: string[],
  partyDate: string,
  giftName: string,
  finalPrice: number,
  pricePerFamily: string,
  comment: string,
  shareCode: string
): string {
  const names = celebrants.join(' y ')
  
  return `🎉 ¡Regalo completado!

Cumpleaños: ${names}
Fiesta: ${partyDate}
Regalo: ${giftName}

💰 Precio final: ${finalPrice}€
👥 Por familia: ${pricePerFamily}€

${comment ? `📝 Nota: ${comment}\n\n` : ''}👉 Ver detalles: ${APP_URL}/gifts/${shareCode}`
}
