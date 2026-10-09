'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

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
    <div className="overlay-modal animar-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-card animar-modal w-full max-w-md space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>
            Atualizar vendas
          </h2>
          <button onClick={onClose} className="btn-icone" aria-label="Fechar">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Esse número representa a média estimada de vendas mensais da loja, não um dado oficial exato.
        </p>

        <div>
          <label className="rotulo">Loja</label>
          <select
            value={lojaId}
            onChange={(e) => setLojaId(e.target.value)}
            className="campo mt-1 w-full"
          >
            <option value="">Selecione...</option>
            {lojas.map((loja) => (
              <option key={loja.id} value={loja.id}>{loja.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="rotulo">Mês (formato AAAA-MM)</label>
          <input
            type="text"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="campo mt-1 w-full"
          />
        </div>

        <div>
          <label className="rotulo">Vendas (média mensal estimada)</label>
          <input
            type="number"
            value={vendas}
            onChange={(e) => setVendas(e.target.value)}
            className="campo mt-1 w-full"
          />
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button onClick={salvar} disabled={salvando} className="btn btn-primary w-full">
          {salvando && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}