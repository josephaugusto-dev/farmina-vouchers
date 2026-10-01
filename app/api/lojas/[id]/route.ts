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

  const loja = await prisma.loja.update({
    where: { id },
    data: { observacoes: body.observacoes },
  })

  return NextResponse.json({ loja })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Remove primeiro os registros mensais da loja (senão o banco bloqueia
  // a exclusão por causa da referência lojaId em RegistroMensal).
  await prisma.registroMensal.deleteMany({ where: { lojaId: id } })
  await prisma.loja.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}