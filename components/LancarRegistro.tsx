'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

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
    <div className="overlay-modal animar-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-card animar-modal w-full max-w-md space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>
            Lançar validações
          </h2>
          <button onClick={onClose} className="btn-icone" aria-label="Fechar">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="rotulo">Vendas (média mensal estimada)</label>
            <input
              type="number"
              value={vendas}
              onChange={(e) => setVendas(e.target.value)}
              className="campo mt-1 w-full"
            />
          </div>
          <div>
            <label className="rotulo">Validações</label>
            <input
              type="number"
              value={validacoes}
              onChange={(e) => setValidacoes(e.target.value)}
              className="campo mt-1 w-full"
            />
          </div>
        </div>

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