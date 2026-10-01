'use client'

import { useState } from 'react'

type Loja = { id: string; nome: string }

export default function LancarRegistro({
  lojas,
  onSalvo,
  onClose,
}: {
  lojas: Loja[]
  onSalvo: () => void
  onClose: () => void
}) {
  const [lojaId, setLojaId] = useState('')
  const [mes, setMes] = useState(() => {
    const agora = new Date()
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
  })
  const [vendas, setVendas] = useState('')
  const [validacoes, setValidacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    if (!lojaId || !validacoes) return
    setSalvando(true)

    await fetch('/api/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lojaId,
        mes,
        vendas: vendas ? parseInt(vendas, 10) : null,
        validacoes: parseInt(validacoes, 10),
        origem: 'manual',
      }),
    })

    setSalvando(false)
    onSalvo()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-blue-950">Lançar validações</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase">Loja</label>
          <select
            value={lojaId}
            onChange={(e) => setLojaId(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
          >
            <option value="">Selecione...</option>
            {lojas.map((loja) => (
              <option key={loja.id} value={loja.id}>{loja.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase">Mês (formato AAAA-MM)</label>
          <input
            type="text"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase">Vendas (média mensal estimada)</label>
            <input
              type="number"
              value={vendas}
              onChange={(e) => setVendas(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">Validações</label>
            <input
              type="number"
              value={validacoes}
              onChange={(e) => setValidacoes(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 rounded-lg disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}