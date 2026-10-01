'use client'

import { useState } from 'react'

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-blue-950">Adicionar loja à base</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase">Nome da loja *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase">Vendedor *</label>
            <input
              type="text"
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">PIN *</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase">Zona</label>
          <input
            type="text"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase">Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 rounded-lg disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Adicionar loja'}
        </button>
      </div>
    </div>
  )
}