'use client'

export type ToastMensagem = { id: number; texto: string }

export default function Toast({ mensagens }: { mensagens: ToastMensagem[] }) {
  if (mensagens.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-60 space-y-2">
      {mensagens.map((m) => (
        <div
          key={m.id}
          className="animar-toast bg-(--primary-dark) text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg"
        >
          {m.texto}
        </div>
      ))}
    </div>
  )
}