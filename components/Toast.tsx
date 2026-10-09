'use client'

import { Check } from 'lucide-react'

export type ToastMensagem = { id: number; texto: string }

export default function Toast({ mensagens }: { mensagens: ToastMensagem[] }) {
  if (mensagens.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-60 space-y-2" role="status" aria-live="polite">
      {mensagens.map((m) => (
        <div
          key={m.id}
          className="animar-toast flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg"
          style={{ background: 'var(--primary-dark)' }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <Check className="h-3.5 w-3.5" aria-hidden />
          </span>
          {m.texto}
        </div>
      ))}
    </div>
  )
}