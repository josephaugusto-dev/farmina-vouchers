'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
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

function corConversao(taxa: number | null) {
  if (taxa === null) return 'bg-gray-100 text-gray-500'
  if (taxa < 30) return 'bg-red-100 text-red-700'
  if (taxa < 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
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

  async function salvarObservacao(id: string, texto: string) {
    await fetch(`/api/lojas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observacoes: texto }),
    })
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
    <main className="min-h-screen p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <Image src="/logo-farmina.png" alt="Farmina" width={40} height={40} className="rounded" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-dark)' }}>
            Farmina Vouchers
          </h1>
        </div>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Monitoramento de validações por loja
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div
            className="rounded-xl px-5 py-4 flex-1 min-w-55 border transition-shadow hover:shadow-md"
            style={{ background: 'var(--white)', borderColor: '#E4E7EC' }}
          >
            <p className="text-xs uppercase" style={{ color: 'var(--text-secondary)' }}>
              Validações no mês
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
              <NumeroAnimado valor={totalValidacoes} />
            </p>
          </div>

          <div
            className="rounded-xl px-5 py-4 flex-1 min-w-65 border transition-shadow hover:shadow-md"
            style={{ background: 'var(--white)', borderColor: '#E4E7EC' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase" style={{ color: 'var(--text-secondary)' }}>
                Meta ({mesMeta || '...'})
              </p>
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
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="number"
                  autoFocus
                  value={valorMetaInput}
                  onChange={(e) => setValorMetaInput(e.target.value)}
                  className="w-24 px-2 py-1 border rounded text-slate-900"
                  style={{ borderColor: '#E4E7EC' }}
                />
                <button
                  onClick={salvarMeta}
                  className="text-sm text-white px-3 py-1 rounded transition-colors"
                  style={{ background: 'var(--primary)' }}
                >
                  Salvar
                </button>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary-dark)' }}>
                  <NumeroAnimado valor={totalValidacoes} /> / {meta ?? '—'}
                </p>
                <div className="w-full h-2 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--primary-light)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressoMeta}%`, background: 'var(--primary)' }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center mb-4 gap-3">
          <input
            type="text"
            placeholder="Buscar por loja ou vendedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 rounded-lg border text-slate-900 placeholder:text-slate-400 transition-shadow focus:outline-none focus:ring-2"
            style={{ borderColor: '#E4E7EC' }}
          />

          <button
            onClick={() => setMostrarLancamento(true)}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: 'var(--primary)' }}
          >
            + Lançar validações
          </button>

          <button
            onClick={() => setMostrarVendas(true)}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: 'var(--primary-dark)' }}
          >
            💰 Atualizar vendas
          </button>

          <button
            onClick={() => setMostrarUploadIA(true)}
            className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            📷 Upload com IA
          </button>

          <button
            onClick={() => setMostrarAdicionarLoja(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ color: 'var(--primary-dark)', borderColor: 'var(--primary)' }}
          >
            + Adicionar loja à base
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
            className="overflow-x-auto rounded-xl border animar-entrada"
            style={{ background: 'var(--white)', borderColor: '#E4E7EC' }}
          >
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }} className="text-left">
                <tr>
                  <th className="px-4 py-3">Loja</th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Mês</th>
                  <th className="px-4 py-3">Vendas (média/mês)</th>
                  <th className="px-4 py-3">Validações</th>
                  <th className="px-4 py-3">Conversão</th>
                  <th className="px-4 py-3">Observações</th>
                </tr>
              </thead>
              <tbody>
                {lojasFiltradas.map((loja, i) => (
                  <tr
                    key={loja.id}
                    className="border-t animar-entrada transition-colors"
                    style={{ borderColor: '#F0F2F5', animationDelay: `${i * 25}ms` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setLojaSelecionada(loja.id)}
                        className="font-medium hover:underline text-left"
                        style={{ color: 'var(--primary)' }}
                      >
                        {loja.nome}
                      </button>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loja.vendedor}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loja.mes ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loja.vendas ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loja.validacoes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${corConversao(loja.taxaConversao)}`}>
                        {loja.taxaConversao !== null ? `${loja.taxaConversao}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        defaultValue={loja.observacoes ?? ''}
                        placeholder="Adicionar nota..."
                        onBlur={(e) => salvarObservacao(loja.id, e.target.value)}
                        className="w-full px-2 py-1 text-slate-900 placeholder:text-slate-400 border border-transparent hover:border-slate-200 rounded focus:outline-none transition-colors"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </main>
  )
}