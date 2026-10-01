import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const PROMPT = `Você está vendo um print de uma tabela dinâmica de relatório da Farmina que mostra o NÚMERO DE VALIDAÇÕES de vouchers por loja.

ESTRUTURA DA TABELA:
- Cada LINHA é uma loja (o nome está em CAIXA ALTA, à esquerda)
- Cada COLUNA de dados representa um período. O cabeçalho da coluna pode ser:
  (a) um mês no formato "AAAA-M" ou "AAAA-MM" (ex: "2026-1", "2026-8") — nesse caso, normalize para "AAAA-MM"
  (b) um texto descritivo que NÃO é um mês (ex: "PP With Purchases - Genius Center", "Total", nomes de métricas) — nesse caso, use exatamente a string "DESCONHECIDO" no lugar do mês
- O cruzamento linha x coluna é o número de validações daquela loja naquele período
- Células VAZIAS significam zero validações — NÃO invente valores, use 0

LINHAS QUE VOCÊ DEVE IGNORAR COMPLETAMENTE:
- A primeira linha de cabeçalho/agregação que começa com "(CF FARMINA SP)" seguido de um nome de pessoa — é o total do consultor, não uma loja
- A linha "(vazio)" ou "(blank)"
- A linha "Total Geral" ou "Grand Total"
- Qualquer linha de subtotal

FORMATO DE SAÍDA (JSON, apenas isso, sem texto ao redor):
{
  "meses": ["2026-07", "2026-08"],
  "lojas": [
    {
      "lojaDetectada": "NOME DA LOJA EXATAMENTE COMO APARECE NA IMAGEM",
      "validacoesPorMes": { "2026-07": 21, "2026-08": 27 }
    }
  ]
}

REGRAS IMPORTANTES:
- Se o cabeçalho não for reconhecível como mês, use "DESCONHECIDO" como chave nesse objeto e no array "meses" — NUNCA use o texto original do cabeçalho como se fosse um mês
- Inclua TODAS as colunas de dados que aparecerem na imagem
- Para células vazias, use 0
- Mantenha o nome da loja EXATAMENTE como está escrito na imagem, sem corrigir nem abreviar`

type ParametrosGeracao = Parameters<typeof ai.models.generateContent>[0]

async function gerarComRetentativa(params: ParametrosGeracao, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await ai.models.generateContent(params)
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : String(err)
      const ehSobrecarga = mensagem.includes('UNAVAILABLE') || mensagem.includes('high demand')
      const ultimaTentativa = i === tentativas - 1

      if (!ehSobrecarga || ultimaTentativa) throw err

      const espera = 2000 * (i + 1)
      await new Promise((resolve) => setTimeout(resolve, espera))
    }
  }
  throw new Error('Falha após todas as tentativas')
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('imagem') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  try {
    const response = await gerarComRetentativa({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType: file.type, data: base64 } },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0,
      },
    })

    const dados = JSON.parse(response.text ?? '{}')
    return NextResponse.json({ dados })
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : String(err)
    const ehSobrecarga = mensagem.includes('UNAVAILABLE') || mensagem.includes('high demand')

    return NextResponse.json(
      {
        error: ehSobrecarga
          ? 'O Gemini está sobrecarregado no momento, mesmo após tentar de novo automaticamente. Aguarde um pouco e tente novamente.'
          : 'Erro ao processar a imagem',
        detalhe: mensagem,
      },
      { status: ehSobrecarga ? 503 : 500 }
    )
  }
}