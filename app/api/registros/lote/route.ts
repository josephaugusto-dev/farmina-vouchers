import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { registros } = body as {
    registros: { lojaId: string; mes: string; validacoes: number; origem: string }[]
  }

  if (!Array.isArray(registros) || registros.length === 0) {
    return NextResponse.json({ error: 'Nenhum registro enviado' }, { status: 400 })
  }

  const resultados = await prisma.$transaction(
    registros.map((r) =>
      prisma.registroMensal.upsert({
        where: { lojaId_mes: { lojaId: r.lojaId, mes: r.mes } },
        update: { validacoes: r.validacoes, origem: r.origem },
        create: { lojaId: r.lojaId, mes: r.mes, validacoes: r.validacoes, origem: r.origem },
      })
    )
  )

  return NextResponse.json({ total: resultados.length })
}