'use client'

import { useState } from 'react'
import { ImageUp, X } from 'lucide-react'

type Loja = { id: string; nome: string }
type LojaExtraida = { lojaDetectada: string; validacoesPorMes: Record<string, number> }
type Extracao = { meses: string[]; lojas: LojaExtraida[] }

function normalizar(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
}

function melhorPalpite(nomeDetectado: string, lojas: Loja[]) {
  const alvo = normalizar(nomeDetectado)
  const exata = lojas.find((l) => normalizar(l.nome) === alvo)
  if (exata) return exata.id

  const palavrasAlvo = new Set(alvo.split(' ').filter((w) => w.length > 2))
  let melhor: { id: string; score: number } | null = null

  for (const loja of lojas) {
    const palavrasLoja = new Set(normalizar(loja.nome).split(' ').filter((w) => w.length > 2))
    const uniao = new Set([...palavrasAlvo, ...palavrasLoja])
    const interseccao = [...palavrasAlvo].filter((w) => palavrasLoja.has(w)).length
    const score = interseccao / uniao.size

    if (score >= 0.45 && (!melhor || score > melhor.score)) {
      melhor = { id: loja.id, score }
    }
  }

  return melhor?.id ?? ''
}

const MES_VALIDO = /^\d{4}-\d{2}$/

export default function UploadImagemIA({
  lojas,
  onClose,
  onSalvo,
}: {
  lojas: Loja[]
  onClose: () => void
  onSalvo: () => void
}) {
  const [extraindo, setExtraindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [extracao, setExtracao] = useState<Extracao | null>(null)
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({})
  const [mesesCorrigidos, setMesesCorrigidos] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)

  async function enviarImagem(file: File) {
    setExtraindo(true)
    setErro(null)

    const formData = new FormData()
    formData.append('imagem', file)

    try {
      const res = await fetch('/api/extrair-imagem', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setErro(data.error ?? 'Erro ao processar imagem')
        setExtraindo(false)
        return
      }

      const dados: Extracao = data.dados
      setExtracao(dados)

      const mapaInicial: Record<string, string> = {}
      dados.lojas.forEach((l) => {
        mapaInicial[l.lojaDetectada] = melhorPalpite(l.lojaDetectada, lojas)
      })
      setMapeamento(mapaInicial)

      // Meses reconhecidos ficam como estão; meses "DESCONHECIDO" ficam em branco,
      // forçando o usuário a preencher manualmente antes de conseguir salvar.
      const mesesIniciais: Record<string, string> = {}
      dados.meses.forEach((mes) => {
        mesesIniciais[mes] = MES_VALIDO.test(mes) ? mes : ''
      })
      setMesesCorrigidos(mesesIniciais)
    } catch {
      setErro('Falha na conexão com o servidor')
    } finally {
      setExtraindo(false)
    }
  }

  async function salvarTudo() {
    if (!extracao) return
    setSalvando(true)

    const registros: { lojaId: string; mes: string; validacoes: number; origem: string }[] = []

    for (const loja of extracao.lojas) {
      const lojaId = mapeamento[loja.lojaDetectada]
      if (!lojaId) continue

      for (const mesOriginal of extracao.meses) {
        const mesFinal = mesesCorrigidos[mesOriginal]
        if (!mesFinal || !MES_VALIDO.test(mesFinal)) continue

        registros.push({
          lojaId,
          mes: mesFinal,
          validacoes: loja.validacoesPorMes[mesOriginal] ?? 0,
          origem: 'imagem_ia',
        })
      }
    }

    await fetch('/api/registros/lote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registros }),
    })

    setSalvando(false)
    onSalvo()
  }

  const totalMapeadas = Object.values(mapeamento).filter(Boolean).length
  const todosMesesValidos =
    extracao?.meses.every((m) => MES_VALIDO.test(mesesCorrigidos[m] ?? '')) ?? false

  const contagemPorLoja: Record<string, number> = {}
  Object.values(mapeamento).forEach((id) => {
    if (id) contagemPorLoja[id] = (contagemPorLoja[id] ?? 0) + 1
  })
  const lojasDuplicadas = new Set(
    Object.entries(contagemPorLoja).filter(([, count]) => count > 1).map(([id]) => id)
  )

  return (
    <div className="overlay-modal animar-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-card animar-modal max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>
            Upload com IA
          </h2>
          <button onClick={onClose} className="btn-icone" aria-label="Fechar">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {!extracao && (
            <div>
              {extraindo ? (
                <div className="zona-upload cursor-default!">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-(--primary)/30 border-t-(--primary)" />
                  <p className="font-medium">Lendo a imagem com IA...</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Isso pode levar até um minuto.
                  </p>
                </div>
              ) : (
                <label className="zona-upload">
                  <ImageUp className="h-7 w-7" aria-hidden />
                  <span className="font-medium">Clique para escolher o print enviado pela supervisora</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    PNG ou JPG
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (file) enviarImagem(file)
                    }}
                  />
                </label>
              )}
              {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
            </div>
          )}

          {extracao && (
            <>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {extracao.lojas.length} lojas detectadas · {extracao.meses.length} coluna(s) de dados.
                Confira o vínculo de cada loja e o mês de cada coluna antes de salvar.
              </p>

              {!todosMesesValidos && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  ⚠️ A imagem não trazia um mês reconhecível em uma ou mais colunas. Preencha o mês
                  correto (formato AAAA-MM) no campo abaixo do cabeçalho antes de salvar.
                </p>
              )}

              {lojasDuplicadas.size > 0 && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  ⚠️ Duas ou mais linhas detectadas estão apontando pra mesma loja no sistema — revise
                  as linhas destacadas em vermelho antes de salvar.
                </p>
              )}

              <div
                className="overflow-x-auto rounded-xl border"
                style={{ borderColor: 'var(--border)' }}
              >
                <table className="w-full text-sm">
                  <thead
                    className="text-left"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                  >
                    <tr>
                      <th className="min-w-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                        Detectado na imagem
                      </th>
                      <th className="min-w-55 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                        Loja no sistema
                      </th>
                      {extracao.meses.map((mes) => (
                        <th key={mes} className="min-w-32 px-3 py-2 text-center">
                          {MES_VALIDO.test(mes) ? (
                            <span className="text-xs font-semibold uppercase tracking-wide">{mes}</span>
                          ) : (
                            <div>
                              <p className="mb-1 text-xs font-normal normal-case text-slate-500">
                                coluna não reconhecida
                              </p>
                              <input
                                type="text"
                                placeholder="AAAA-MM"
                                value={mesesCorrigidos[mes] ?? ''}
                                onChange={(e) =>
                                  setMesesCorrigidos((m) => ({ ...m, [mes]: e.target.value }))
                                }
                                className={`campo w-full text-center font-normal ${
                                  MES_VALIDO.test(mesesCorrigidos[mes] ?? '') ? '' : 'border-amber-400!'
                                }`}
                              />
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {extracao.lojas.map((loja) => {
                      const idSelecionado = mapeamento[loja.lojaDetectada]
                      const conflito = idSelecionado && lojasDuplicadas.has(idSelecionado)
                      return (
                        <tr
                          key={loja.lojaDetectada}
                          className={`border-t ${conflito ? 'bg-red-50' : ''}`}
                          style={{ borderColor: '#F0F2F5' }}
                        >
                          <td className="px-3 py-2" style={{ color: 'var(--text)' }}>
                            {loja.lojaDetectada}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={idSelecionado ?? ''}
                              onChange={(e) =>
                                setMapeamento((m) => ({ ...m, [loja.lojaDetectada]: e.target.value }))
                              }
                              className={`campo w-full py-1! ${conflito ? 'border-red-400!' : ''}`}
                            >
                              <option value="">Ignorar</option>
                              {lojas.map((l) => (
                                <option key={l.id} value={l.id}>{l.nome}</option>
                              ))}
                            </select>
                          </td>
                          {extracao.meses.map((mes) => (
                            <td
                              key={mes}
                              className="px-3 py-2 text-center"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {loja.validacoesPorMes[mes] ?? 0}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {totalMapeadas} de {extracao.lojas.length} lojas vinculadas
                </p>
                <button
                  onClick={salvarTudo}
                  disabled={salvando || totalMapeadas === 0 || lojasDuplicadas.size > 0 || !todosMesesValidos}
                  className="btn btn-primary"
                >
                  {salvando && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {salvando ? 'Salvando...' : `Salvar ${totalMapeadas} loja(s)`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}