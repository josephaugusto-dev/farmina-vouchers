'use client'

import { useEffect, useState } from 'react'

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animar-overlay">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl animar-modal">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>
            {loja?.nome ?? 'Carregando...'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {loja && (
          <div className="px-6 py-5 space-y-5">
            {!editando ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Vendedor</p>
                    <p className="text-slate-800 font-medium">{loja.vendedor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase">PIN</p>
                    <p className="text-slate-800 font-medium font-mono">{loja.pin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Telefone</p>
                    <p className="text-slate-800 font-medium">{loja.telefone ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Zona</p>
                    <p className="text-slate-800 font-medium">{loja.zona ?? '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 uppercase">E-mail</p>
                    <p className="text-slate-800 font-medium break-all">{loja.email ?? '—'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditando(true)}
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  ✎ Editar informações da loja
                </button>
              </>
            ) : (
              <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Editando cadastro</p>

                <div>
                  <label className="text-xs text-slate-400 uppercase">Nome da loja *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 uppercase">Vendedor *</label>
                    <input
                      type="text"
                      value={form.vendedor}
                      onChange={(e) => setForm((f) => ({ ...f, vendedor: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase">PIN *</label>
                    <input
                      type="text"
                      value={form.pin}
                      onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase">Zona</label>
                  <input
                    type="text"
                    value={form.zona}
                    onChange={(e) => setForm((f) => ({ ...f, zona: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 uppercase">Telefone</label>
                    <input
                      type="text"
                      value={form.telefone}
                      onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase">E-mail</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                {erroEdicao && <p className="text-sm text-red-600">{erroEdicao}</p>}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={salvarEdicao}
                    disabled={salvandoEdicao}
                    className="text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                    style={{ background: 'var(--primary)' }}
                  >
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
                    className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400 uppercase mb-2">Histórico de validações</p>
              <p className="text-xs text-slate-400 mb-2">
                O valor de vendas é uma estimativa da média mensal da loja, não um número oficial exato.
              </p>
              <div className="space-y-2">
                {loja.registros.length === 0 && (
                  <p className="text-sm text-slate-400">Nenhum registro ainda.</p>
                )}
                {loja.registros.map((r) => (
                  <div
                    key={r.id}
                    className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-700">{r.mes}</span>
                    <span className="text-slate-500">
                      {r.vendas ?? '—'} vendas (méd.) · {r.validacoes} validações
                    </span>
                    <span className="text-xs text-slate-400">{r.origem}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {!confirmandoExclusao ? (
                <button
                  onClick={() => setConfirmandoExclusao(true)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Excluir loja da base
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-red-700">
                    Isso vai apagar a loja e todo o histórico de validações dela. Essa ação não pode ser desfeita. Confirma?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={excluirLoja}
                      disabled={excluindo}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {excluindo ? 'Excluindo...' : 'Sim, excluir'}
                    </button>
                    <button
                      onClick={() => setConfirmandoExclusao(false)}
                      className="text-sm text-slate-500 hover:text-slate-700 px-4 py-1.5"
                    >
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