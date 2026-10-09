'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, ClipboardCheck, Plus, Search, Sparkles, TrendingUp } from 'lucide-react'
import DetalheLoja from '@/components/DetalheLoja'
import LancarRegistro from '@/components/LancarRegistro'
import UploadImagemIA from '@/components/UploadImagemIA'
import AdicionarLoja from '@/components/AdicionarLoja'
import AtualizarVendas from '@/components/AtualizarVendas'
import NumeroAnimado from '@/components/NumeroAnimado'
import Toast, { ToastMensagem } from '@/components/Toast'

type Loja = {
  id: string
  nome: string
  vendedor: string
  pin: string
  zona: string | null
  telefone: string | null
  email: string | null
  observacoes: string | null
  mes: string | null
  vendas: number | null
  validacoes: number | null
  taxaConversao: number | null
}

function classeConversao(taxa: number | null) {
  if (taxa === null) return 'badge badge-neutro'
  if (taxa < 30) return 'badge badge-baixo'
  if (taxa < 60) return 'badge badge-medio'
  return 'badge badge-alto'
}

export default function Home() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [meta, setMeta] = useState<number | null>(null)
  const [mesMeta, setMesMeta] = useState('')
  const [editandoMeta, setEditandoMeta] = useState(false)
  const [valorMetaInput, setValorMetaInput] = useState('')
  const [lojaSelecionada, setLojaSelecionada] = useState<string | null>(null)
  const [mostrarLancamento, setMostrarLancamento] = useState(false)
  const [mostrarUploadIA, setMostrarUploadIA] = useState(false)
  const [mostrarAdicionarLoja, setMostrarAdicionarLoja] = useState(false)
  const [mostrarVendas, setMostrarVendas] = useState(false)
  const [toasts, setToasts] = useState<ToastMensagem[]>([])
  const [rolou, setRolou] = useState(false)
  const proximoIdToast = useRef(0)

  function mostrarToast(texto: string) {
    proximoIdToast.current += 1
    const id = proximoIdToast.current
    setToasts((t) => [...t, { id, texto }])
    setTimeout(() => setToasts((t) => t.filter((m) => m.id !== id)), 3000)
  }

  function recarregarLojas() {
    fetch('/api/lojas')
      .then((res) => res.json())
      .then((data) => {
        setLojas(data.lojas)
        setCarregando(false)
      })
  }

  useEffect(() => {
    recarregarLojas()

    fetch('/api/meta')
      .then((res) => res.json())
      .then((data) => {
        setMeta(data.valor)
        setMesMeta(data.mes)
      })
  }, [])

  useEffect(() => {
    function aoRolar() {
      setRolou(window.scrollY > 8)
    }
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  const totalValidacoes = lojas.reduce((soma, loja) => soma + (loja.validacoes ?? 0), 0)
  const progressoMeta = meta && meta > 0 ? Math.min((totalValidacoes / meta) * 100, 100) : 0

  async function salvarMeta() {
    const valor = parseInt(valorMetaInput, 10)
    if (isNaN(valor)) return

    const res = await fetch('/api/meta', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor }),
    })
    const data = await res.json()
    setMeta(data.meta.valor)
    setEditandoMeta(false)
    mostrarToast('Meta atualizada')
  }

  async function salvarObservacao(id: string, texto: string, original: string | null) {
    if (texto === (original ?? '')) return

    await fetch(`/api/lojas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observacoes: texto }),
    })
    setLojas((atual) => atual.map((l) => (l.id === id ? { ...l, observacoes: texto } : l)))
    mostrarToast('Observação salva')
  }

  const lojasFiltradas = lojas.filter((loja) => {
    const termo = busca.toLowerCase()
    return (
      loja.nome.toLowerCase().includes(termo) ||
      loja.vendedor.toLowerCase().includes(termo)
    )
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className={`cabecalho ${rolou ? 'cabecalho-rolou' : ''}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
          <Image src="/logo-farmina.png" alt="Farmina" width={40} height={40} className="rounded" priority />
          <div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--primary-dark)' }}>
              Farmina Vouchers
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Monitoramento de validações por loja
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="card min-w-55 flex-1 px-5 py-4">
            <p className="rotulo">Validações no mês</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              <NumeroAnimado valor={totalValidacoes} />
            </p>
          </div>

          <div className="card min-w-65 flex-1 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="rotulo">Meta ({mesMeta || '...'})</p>
              {!editandoMeta && (
                <button
                  onClick={() => {
                    setValorMetaInput(String(meta ?? ''))
                    setEditandoMeta(true)
                  }}
                  className="text-xs font-medium hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  editar
                </button>
              )}
            </div>

            {editandoMeta ? (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  autoFocus
                  value={valorMetaInput}
                  onChange={(e) => setValorMetaInput(e.target.value)}
                  className="campo w-24"
                />
                <button onClick={salvarMeta} className="btn btn-primary btn-sm">
                  Salvar
                </button>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold" style={{ color: 'var(--primary-dark)' }}>
                  <NumeroAnimado valor={totalValidacoes} /> / {meta ?? '—'}
                </p>
                <div className="barra-trilho mt-2">
                  <div className="barra-fill" style={{ width: `${progressoMeta}%` }} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 max-w-md flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--text-secondary)' }}
              aria-hidden
            />
            <input
              type="text"
              placeholder="Buscar por loja ou vendedor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="campo w-full pl-10"
            />
          </div>

          <button onClick={() => setMostrarLancamento(true)} className="btn btn-primary">
            <ClipboardCheck className="ico ico-clip" aria-hidden />
            Lançar validações
          </button>

          <button onClick={() => setMostrarVendas(true)} className="btn btn-dark">
            <TrendingUp className="ico ico-trend" aria-hidden />
            Atualizar vendas
          </button>

          <button onClick={() => setMostrarUploadIA(true)} className="btn btn-ai">
            <Sparkles className="ico ico-sparkle" aria-hidden />
            Upload com IA
          </button>

          <button onClick={() => setMostrarAdicionarLoja(true)} className="btn btn-outline">
            <Plus className="ico ico-rotate" aria-hidden />
            Adicionar loja à base
          </button>
        </div>

        {carregando ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : (
          <div
            className="animar-entrada overflow-x-auto rounded-xl border bg-white"
            style={{ borderColor: 'var(--border)' }}
          >
            <table className="w-full text-sm">
              <thead
                className="text-left text-xs uppercase tracking-wide"
                style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">Loja</th>
                  <th className="px-4 py-3 font-semibold">Vendedor</th>
                  <th className="px-4 py-3 font-semibold">Mês</th>
                  <th className="px-4 py-3 font-semibold">Vendas (média/mês)</th>
                  <th className="px-4 py-3 font-semibold">Validações</th>
                  <th className="px-4 py-3 font-semibold">Conversão</th>
                  <th className="px-4 py-3 font-semibold">Observações</th>
                </tr>
              </thead>
              <tbody>
                {lojasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Nenhuma loja encontrada.
                    </td>
                  </tr>
                )}

                {lojasFiltradas.map((loja, i) => (
                  <tr
                    key={loja.id}
                    className="linha-loja animar-entrada border-t"
                    style={{ borderColor: '#F0F2F5', animationDelay: `${Math.min(i, 12) * 25}ms` }}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setLojaSelecionada(loja.id)}
                        className="nome-loja inline-flex items-center gap-1 text-left font-medium"
                        style={{ color: 'var(--primary)' }}
                      >
                        {loja.nome}
                        <ArrowUpRight className="seta-loja h-4 w-4" aria-hidden />
                      </button>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loja.vendedor}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loja.mes ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loja.vendas ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loja.validacoes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={classeConversao(loja.taxaConversao)}>
                        {loja.taxaConversao !== null ? `${loja.taxaConversao}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        defaultValue={loja.observacoes ?? ''}
                        placeholder="Adicionar nota..."
                        onBlur={(e) => salvarObservacao(loja.id, e.target.value, loja.observacoes)}
                        className="w-full rounded border border-transparent bg-transparent px-2 py-1 transition-colors placeholder:text-slate-400 hover:border-slate-200 focus:border-(--primary) focus:bg-white focus:outline-none"
                        style={{ color: 'var(--text)' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {lojaSelecionada && (
        <DetalheLoja
          lojaId={lojaSelecionada}
          onClose={() => setLojaSelecionada(null)}
          onExcluida={() => {
            setLojaSelecionada(null)
            recarregarLojas()
            mostrarToast('Loja excluída')
          }}
        />
      )}

      {mostrarLancamento && (
        <LancarRegistro
          lojas={lojas}
          onClose={() => setMostrarLancamento(false)}
          onSalvo={() => {
            setMostrarLancamento(false)
            recarregarLojas()
            mostrarToast('Validações lançadas')
          }}
        />
      )}

      {mostrarVendas && (
        <AtualizarVendas
          lojas={lojas}
          onClose={() => setMostrarVendas(false)}
          onSalvo={() => {
            setMostrarVendas(false)
            recarregarLojas()
            mostrarToast('Vendas atualizadas')
          }}
        />
      )}

      {mostrarUploadIA && (
        <UploadImagemIA
          lojas={lojas}
          onClose={() => setMostrarUploadIA(false)}
          onSalvo={() => {
            setMostrarUploadIA(false)
            recarregarLojas()
            mostrarToast('Dados importados com sucesso')
          }}
        />
      )}

      {mostrarAdicionarLoja && (
        <AdicionarLoja
          onClose={() => setMostrarAdicionarLoja(false)}
          onSalvo={() => {
            setMostrarAdicionarLoja(false)
            recarregarLojas()
            mostrarToast('Loja adicionada')
          }}
        />
      )}

      <Toast mensagens={toasts} />
    </div>
  )
}