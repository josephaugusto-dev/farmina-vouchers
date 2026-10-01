import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const lojas = await prisma.loja.findMany({
    include: {
      registros: {
        orderBy: { mes: 'desc' },
        take: 1,
      },
    },
    orderBy: { nome: 'asc' },
  })

  const resultado = lojas.map((loja) => {
    const registro = loja.registros[0] ?? null
    const taxaConversao =
      registro && registro.vendas && registro.vendas > 0
        ? Math.round((registro.validacoes / registro.vendas) * 100)
        : null

    return {
      id: loja.id,
      nome: loja.nome,
      vendedor: loja.vendedor,
      pin: loja.pin,
      zona: loja.zona,
      telefone: loja.telefone,
      email: loja.email,
      observacoes: loja.observacoes,
      mes: registro?.mes ?? null,
      vendas: registro?.vendas ?? null,
      validacoes: registro?.validacoes ?? null,
      taxaConversao,
    }
  })

  return NextResponse.json({ lojas: resultado })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { nome, vendedor, pin, zona, telefone, email } = body

  if (!nome || !vendedor || !pin) {
    return NextResponse.json(
      { error: 'Nome, vendedor e PIN são obrigatórios' },
      { status: 400 }
    )
  }

  const loja = await prisma.loja.create({
    data: { nome, vendedor, pin, zona, telefone, email },
  })

  return NextResponse.json({ loja })
}