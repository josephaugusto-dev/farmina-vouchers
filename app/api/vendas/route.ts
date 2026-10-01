import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    const { lojaId, mes, vendas } = body

    if (!lojaId || !mes || vendas === undefined || vendas === null) {
        return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const registro = await prisma.registroMensal.upsert({
        where: { lojaId_mes: { lojaId, mes } },
        update: { vendas },
        create: { lojaId, mes, vendas, validacoes: 0, origem: 'manual' },
    })

    return NextResponse.json({ registro })
}