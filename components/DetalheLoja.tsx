'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'

type Registro = {
  id: string
  mes: string
  vendas: number | null
  validacoes: number
  origem: string
}

type LojaDetalhe = {
  id: string
  nome: string
  vendedor: string
  pin: string
  zona: string | null
  telefone: string | null
  email: string | null
  observacoes: string | null
  registros: Registro[]
}

type FormEdicao = {
  nome: string
  vendedor: string
  pin: string
  zona: string
  telefone: string
  email: string
}

export default function DetalheLoja({
  lojaId,
  onClose,
  onExcluida,
}: {
  lojaId: string
  onClose: () => void
  onExcluida: () => void
}) {
  const [loja, setLoja] = useState<LojaDetalhe | null>(null)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [editando, setEditando] = useState(false)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [erroEdicao, setErroEdicao] = useState<string | null>(null)
  const [form, setForm] = useState<FormEdicao>({
    nome: '',
    vendedor: '',
    pin: '',
    zona: '',
    telefone: '',
    email: '',
  })

  function carregarLoja() {
    fetch(`/api/lojas/${lojaId}`)
      .then((res) => res.json())
      .then((data) => {
        setLoja(data.loja)
        setForm({
          nome: data.loja.nome ?? '',
          vendedor: data.loja.vendedor ?? '',
          pin: data.loja.pin ?? '',
          zona: data.loja.zona ?? '',
          telefone: data.loja.telefone ?? '',
          email: data.loja.email ?? '',
        })
      })
  }

  useEffect(() => {
    carregarLoja()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lojaId])

  async function salvarEdicao() {
    if (!form.nome || !form.vendedor || !form.pin) {
      setErroEdicao('Nome, vendedor e PIN são obrigatórios')
      return
    }

    setSalvandoEdicao(true)
    setErroEdicao(null)

    const res = await fetch(`/api/lojas/${lojaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      setErroEdicao('Erro ao salvar as alterações')
      setSalvandoEdicao(false)
      return
    }

    setSalvandoEdicao(false)
    setEditando(false)
    carregarLoja()
  }

  async function excluirLoja() {
    setExcluindo(true)
    await fetch(`/api/lojas/${lojaId}`, { method: 'DELETE' })
    setExcluindo(false)
    onExcluida()
  }

  return (
    <div className="overlay-modal animar-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-card animar-modal max-h-[85vh] w-full max-w-lg overflow-y-auto">
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>
            {loja?.nome ?? 'Carregando...'}
          </h2>
          <button onClick={onClose} className="btn-icone" aria-label="Fechar">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {loja && (
          <div className="space-y-5 px-6 py-5">
            {!editando ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="rotulo">Vendedor</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{loja.vendedor}</p>
                  </div>
                  <div>
                    <p className="rotulo">PIN</p>
                    <p className="font-mono font-medium" style={{ color: 'var(--text)' }}>{loja.pin}</p>
                  </div>
                  <div>
                    <p className="rotulo">Telefone</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{loja.telefone ?? '—'}</p>
                  </div>
                  <div>
                    <p className="rotulo">Zona</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{loja.zona ?? '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="rotulo">E-mail</p>
                    <p className="break-all font-medium" style={{ color: 'var(--text)' }}>{loja.email ?? '—'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditando(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Editar informações da loja
                </button>
              </>
            ) : (
              <div className="space-y-3 rounded-xl p-4" style={{ background: 'var(--primary-light)' }}>
                <p className="rotulo">Editando cadastro</p>

                <div>
                  <label className="rotulo">Nome da loja *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    className="campo mt-1 w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="rotulo">Vendedor *</label>
                    <input
                      type="text"
                      value={form.vendedor}
                      onChange={(e) => setForm((f) => ({ ...f, vendedor: e.target.value }))}
                      className="campo mt-1 w-full"
                    />
                  </div>
                  <div>
                    <label className="rotulo">PIN *</label>
                    <input
                      type="text"
                      value={form.pin}
                      onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
                      className="campo mt-1 w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="rotulo">Zona</label>
                  <input
                    type="text"
                    value={form.zona}
                    onChange={(e) => setForm((f) => ({ ...f, zona: e.target.value }))}
                    className="campo mt-1 w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="rotulo">Telefone</label>
                    <input
                      type="text"
                      value={form.telefone}
                      onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                      className="campo mt-1 w-full"
                    />
                  </div>
                  <div>
                    <label className="rotulo">E-mail</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="campo mt-1 w-full"
                    />
                  </div>
                </div>

                {erroEdicao && <p className="text-sm text-red-600">{erroEdicao}</p>}

                <div className="flex gap-2 pt-1">
                  <button onClick={salvarEdicao} disabled={salvandoEdicao} className="btn btn-primary btn-sm">
                    {salvandoEdicao && (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                  <button
                    onClick={() => {
                      setEditando(false)
                      setErroEdicao(null)
                      if (loja) {
                        setForm({
                          nome: loja.nome,
                          vendedor: loja.vendedor,
                          pin: loja.pin,
                          zona: loja.zona ?? '',
                          telefone: loja.telefone ?? '',
                          email: loja.email ?? '',
                        })
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div>
              <p className="rotulo mb-2">Histórico de validações</p>
              <p className="mb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                O valor de vendas é uma estimativa da média mensal da loja, não um número oficial exato.
              </p>
              <div className="space-y-2">
                {loja.registros.length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhum registro ainda.</p>
                )}
                {loja.registros.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'var(--background)' }}
                  >
                    <span className="font-medium" style={{ color: 'var(--text)' }}>{r.mes}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {r.vendas ?? '—'} vendas (méd.) · {r.validacoes} validações
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.origem}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
              {!confirmandoExclusao ? (
                <button
                  onClick={() => setConfirmandoExclusao(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Excluir loja da base
                </button>
              ) : (
                <div className="animar-entrada space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">
                    Isso vai apagar a loja e todo o histórico de validações dela. Essa ação não pode ser desfeita. Confirma?
                  </p>
                  <div className="flex gap-2">
                    <button onClick={excluirLoja} disabled={excluindo} className="btn btn-danger btn-sm">
                      {excluindo ? 'Excluindo...' : 'Sim, excluir'}
                    </button>
                    <button onClick={() => setConfirmandoExclusao(false)} className="btn btn-ghost btn-sm">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}