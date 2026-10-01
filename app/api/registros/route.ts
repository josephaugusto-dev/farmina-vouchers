import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { lojaId, mes, vendas, validacoes, origem } = body

  if (!lojaId || !mes || validacoes === undefined) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const registro = await prisma.registroMensal.upsert({
    where: { lojaId_mes: { lojaId, mes } },
    update: { vendas, validacoes, origem },
    create: { lojaId, mes, vendas, validacoes, origem },
  })

  return NextResponse.json({ registro })
}