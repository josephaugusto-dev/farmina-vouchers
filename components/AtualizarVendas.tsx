'use client'

import { useState } from 'react'

type Loja = { id: string; nome: string }

export default function AtualizarVendas({
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
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    if (!lojaId || vendas === '') {
      setErro('Selecione a loja e informe o número de vendas')
      return
    }

    setSalvando(true)
    setErro(null)

    const res = await fetch('/api/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lojaId, mes, vendas: parseInt(vendas, 10) }),
    })

    if (!res.ok) {
      setErro('Erro ao salvar')
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
          <h2 className="text-lg font-bold text-blue-950">Atualizar vendas</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
        </div>

        <p className="text-xs text-slate-400">
          Esse número representa a média estimada de vendas mensais da loja, não um dado oficial exato.
        </p>

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

        <div>
          <label className="text-xs text-slate-400 uppercase">Vendas (média mensal estimada)</label>
          <input
            type="number"
            value={vendas}
            onChange={(e) => setVendas(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

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