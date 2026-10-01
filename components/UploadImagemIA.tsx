'use client'

import { useState } from 'react'

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-blue-950">Upload com IA</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
        </div>

        <div className="p-6 space-y-5">
          {!extracao && (
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Selecione o print enviado pela supervisora:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) enviarImagem(file)
                }}
                className="text-sm text-slate-700"
              />
              {extraindo && (
                <p className="text-sm text-blue-700 mt-3">
                  Lendo a imagem com IA, isso pode levar até um minuto...
                </p>
              )}
              {erro && <p className="text-sm text-red-600 mt-3">{erro}</p>}
            </div>
          )}

          {extracao && (
            <>
              <p className="text-sm text-slate-500">
                {extracao.lojas.length} lojas detectadas · {extracao.meses.length} coluna(s) de dados.
                Confira o vínculo de cada loja e o mês de cada coluna antes de salvar.
              </p>

              {!todosMesesValidos && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ A imagem não trazia um mês reconhecível em uma ou mais colunas. Preencha o mês
                  correto (formato AAAA-MM) no campo abaixo do cabeçalho antes de salvar.
                </p>
              )}

              {lojasDuplicadas.size > 0 && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  ⚠️ Duas ou mais linhas detectadas estão apontando pra mesma loja no sistema — revise
                  as linhas destacadas em vermelho antes de salvar.
                </p>
              )}

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 text-left">
                    <tr>
                      <th className="px-3 py-2 min-w-[200px]">Detectado na imagem</th>
                      <th className="px-3 py-2 min-w-[220px]">Loja no sistema</th>
                      {extracao.meses.map((mes) => (
                        <th key={mes} className="px-3 py-2 text-center min-w-[130px]">
                          {MES_VALIDO.test(mes) ? (
                            mes
                          ) : (
                            <div>
                              <p className="text-xs text-slate-400 normal-case mb-1">
                                coluna não reconhecida
                              </p>
                              <input
                                type="text"
                                placeholder="AAAA-MM"
                                value={mesesCorrigidos[mes] ?? ''}
                                onChange={(e) =>
                                  setMesesCorrigidos((m) => ({ ...m, [mes]: e.target.value }))
                                }
                                className={`w-full px-2 py-1 border rounded text-center text-slate-900 font-normal ${
                                  MES_VALIDO.test(mesesCorrigidos[mes] ?? '')
                                    ? 'border-slate-200'
                                    : 'border-amber-400'
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
                          className={`border-t border-slate-100 ${conflito ? 'bg-red-50' : ''}`}
                        >
                          <td className="px-3 py-2 text-slate-700">{loja.lojaDetectada}</td>
                          <td className="px-3 py-2">
                            <select
                              value={idSelecionado ?? ''}
                              onChange={(e) =>
                                setMapeamento((m) => ({ ...m, [loja.lojaDetectada]: e.target.value }))
                              }
                              className={`w-full px-2 py-1 border rounded text-slate-900 ${
                                conflito ? 'border-red-400' : 'border-slate-200'
                              }`}
                            >
                              <option value="">Ignorar</option>
                              {lojas.map((l) => (
                                <option key={l.id} value={l.id}>{l.nome}</option>
                              ))}
                            </select>
                          </td>
                          {extracao.meses.map((mes) => (
                            <td key={mes} className="px-3 py-2 text-center text-slate-600">
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
                <p className="text-sm text-slate-500">
                  {totalMapeadas} de {extracao.lojas.length} lojas vinculadas
                </p>
                <button
                  onClick={salvarTudo}
                  disabled={salvando || totalMapeadas === 0 || lojasDuplicadas.size > 0 || !todosMesesValidos}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-5 py-2 rounded-lg disabled:opacity-50"
                >
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