import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const loja = await prisma.loja.findUnique({
    where: { id },
    include: {
      registros: {
        orderBy: { mes: 'desc' },
      },
    },
  })

  if (!loja) {
    return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
  }

  return NextResponse.json({ loja })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const dadosPermitidos = ['nome', 'vendedor', 'pin', 'zona', 'telefone', 'email', 'observacoes']
  const data: Record<string, string | null> = {}

  for (const campo of dadosPermitidos) {
    if (campo in body) {
      data[campo] = body[campo]
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  const loja = await prisma.loja.update({
    where: { id },
    data,
  })

  return NextResponse.json({ loja })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.registroMensal.deleteMany({ where: { lojaId: id } })
  await prisma.loja.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}