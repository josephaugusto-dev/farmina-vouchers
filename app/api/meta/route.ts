import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function mesAtual() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  return `${ano}-${mes}`
}

export async function GET() {
  const mes = mesAtual()
  const meta = await prisma.metaMensal.findUnique({ where: { mes } })
  return NextResponse.json({ mes, valor: meta?.valor ?? null })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const mes = mesAtual()

  const meta = await prisma.metaMensal.upsert({
    where: { mes },
    update: { valor: body.valor },
    create: { mes, valor: body.valor },
  })

  return NextResponse.json({ meta })
}