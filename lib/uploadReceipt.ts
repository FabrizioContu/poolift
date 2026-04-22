export async function uploadReceipt(file: File, giftId: string, shareCode?: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('giftId', giftId)
  if (shareCode) formData.append('shareCode', shareCode)

  const res = await fetch('/api/upload/receipt', { method: 'POST', body: formData })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || 'Error al subir recibo')
  return data.url as string
}
