'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function AdicionarLoja({
  onClose,
  onSalvo,
}: {
  onClose: () => void
  onSalvo: () => void
}) {
  const [nome, setNome] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [pin, setPin] = useState('')
  const [zona, setZona] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    if (!nome || !vendedor || !pin) {
      setErro('Nome, vendedor e PIN são obrigatórios')
      return
    }

    setSalvando(true)
    setErro(null)

    const res = await fetch('/api/lojas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, vendedor, pin, zona, telefone, email }),
    })

    if (!res.ok) {
      const data = await res.json()
      setErro(data.error ?? 'Erro ao adicionar loja')
      setSalvando(false)
      return
    }

    setSalvando(false)
    onSalvo()
  }

  return (
    <div className="overlay-modal animar-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-card animar-modal w-full max-w-md space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>
            Adicionar loja à base
          </h2>
          <button onClick={onClose} className="btn-icone" aria-label="Fechar">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div>
          <label className="rotulo">Nome da loja *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="campo mt-1 w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="rotulo">Vendedor *</label>
            <input
              type="text"
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
              className="campo mt-1 w-full"
            />
          </div>
          <div>
            <label className="rotulo">PIN *</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="campo mt-1 w-full"
            />
          </div>
        </div>

        <div>
          <label className="rotulo">Zona</label>
          <input
            type="text"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="campo mt-1 w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="rotulo">Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="campo mt-1 w-full"
            />
          </div>
          <div>
            <label className="rotulo">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="campo mt-1 w-full"
            />
          </div>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button onClick={salvar} disabled={salvando} className="btn btn-primary w-full">
          {salvando && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {salvando ? 'Salvando...' : 'Adicionar loja'}
        </button>
      </div>
    </div>
  )
}