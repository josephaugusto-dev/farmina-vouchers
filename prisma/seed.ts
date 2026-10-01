import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const MES_REFERENCIA = '2026-08'

type LojaSeed = {
  nome: string
  vendedor: string
  pin: string
  zona?: string
  telefone?: string
  email?: string
  vendas: number | null
  validacoes: number
}

const lojas: LojaSeed[] = [
  { nome: 'Breeds Vila Prudente', vendedor: 'Carioca', pin: 'avpcqj1611', zona: 'ZONA LESTE', telefone: '1122192000', email: 'DIOGO@BREEDS.COM.BR', vendas: 16, validacoes: 5 },
  { nome: '3RD Pet Shop Vila Zelina', vendedor: 'Fernando', pin: 'xuwpst2172', zona: 'ZONA LESTE', email: 'ricardovirgilio@gmail.com', vendas: 56, validacoes: 39 },
  { nome: 'Autacadao Pet', vendedor: 'Rogerio', pin: 'dclnnh7535', zona: 'ZONA LESTE', telefone: '(16) 99607-1864', email: 'rossi.negocios@gmail.com', vendas: 11, validacoes: 4 },
  { nome: 'Benipet Anhaia Melo', vendedor: 'Fernando', pin: 'luttnz3294', zona: 'ZONA LESTE', telefone: '11234714 55', email: 'luis@benipet.com.br', vendas: 23, validacoes: 5 },
  { nome: 'Caomarada', vendedor: 'Rogerio', pin: 'jcjdpt9652', zona: 'ZONA LESTE', telefone: '(11) 22963033', email: 'roycortiz@gmail.com', vendas: 13, validacoes: 3 },
  { nome: 'Pet Orient', vendedor: 'Rogerio', pin: 'kpktdb7448', zona: 'ZONA LESTE', telefone: '(11) 94720-3445', email: 'compras.casaoriente@yahoo.com', vendas: 51, validacoes: 41 },
  { nome: 'Fofinho Pet Shop', vendedor: 'Flavia', pin: 'dpnrpx2991', zona: 'ZONA LESTE', telefone: '(11) 2651-0914', email: 'FOFINHOVILAMATILDE@GMAIL.COM', vendas: 13, validacoes: 5 },
  { nome: 'Market Pet', vendedor: 'Rogerio', pin: 'utxbfu5595', zona: 'ZONA LESTE', telefone: '2589-0909', email: 'mercadopetvilare@gmail.com', vendas: 21, validacoes: 6 },
  { nome: 'Mercadao Pet Patriarca', vendedor: 'Flavia', pin: 'dwpprr4623', zona: 'ZONA LESTE', telefone: '1126849675', email: 'mercadaopet@hotmail.com', vendas: 35, validacoes: 3 },
  { nome: 'Mercadao Pet Marechal', vendedor: 'Flavia', pin: 'voteyv6537', zona: 'ZONA LESTE', telefone: '(11)2025-1784', email: 'mercadaopetmarechal@outlook.com', vendas: 26, validacoes: 5 },
  { nome: 'Pet Brasil', vendedor: 'Rogerio', pin: 'ztjvdl9965', zona: 'ZONA LESTE', telefone: '2023-2717', email: 'petbrasil.saomiguel2@gmail.com', vendas: 51, validacoes: 42 },
  { nome: 'Pet Center Express', vendedor: 'Fernando', pin: 'wotcxt5398', zona: 'ZONA LESTE', telefone: '(11) 3926-6919', email: 'LOJA@PETCENTEREXPRESS.COM.BR', vendas: 10, validacoes: 2 },
  { nome: 'Praça Do Pet 4', vendedor: 'Flavia', pin: 'bybfqh8443', zona: 'ZONA LESTE', telefone: '(11) 95797-1237', email: 'PRACADOPET@YAHOO.COM', vendas: 26, validacoes: 5 },
  { nome: 'Winner Dogs', vendedor: 'Rogerio', pin: 'zfbcmc3311', zona: 'ZONA LESTE', telefone: '(11)2385-5219', email: 'simone@salceda.com.br', vendas: 13, validacoes: 5 },
  { nome: 'Yes Pet Ponte Rasa', vendedor: 'Anderson', pin: 'kwihpb6325', zona: 'ZONA LESTE', telefone: '(11) 99893-4895', email: 'contato4yps@gmail.com', vendas: 16, validacoes: 6 },
  { nome: 'Pet Maxi São Miguel', vendedor: 'Alexsander', pin: 'dtyizl4754', zona: 'ZONA LESTE', telefone: '(11) 99408-7665', email: 'petmaxi@terra.com.br', vendas: 8, validacoes: 2 },
  { nome: 'Dogs Day Mooca', vendedor: 'Alexsander', pin: 'zswnig1447', zona: 'ZONA LESTE', telefone: '(11) 98603-0068', email: 'dogsday8@gmail.com', vendas: 9, validacoes: 3 },
  { nome: 'Dogs Day Celso Garcia', vendedor: 'Alexsander', pin: 'llupsg3124', zona: 'ZONA LESTE', telefone: '11982370835', email: 'MIKI.UEHARA@UOL.COM.BR', vendas: null, validacoes: 2 },
  { nome: 'Dogs Day Analia Franco', vendedor: 'Alexsander', pin: 'rtddxe1267', zona: 'ZONA LESTE', telefone: '1126711694', email: 'ALD.UEHARA@GMAIL.COM', vendas: 59, validacoes: 39 },
  { nome: 'Pet Shop São Francisco', vendedor: 'Rogerio', pin: 'rfnfan1759', telefone: '11 91996-5560', vendas: 6, validacoes: 3 },
]

async function main() {
  for (const loja of lojas) {
    const criada = await prisma.loja.create({
      data: {
        nome: loja.nome,
        vendedor: loja.vendedor,
        pin: loja.pin,
        zona: loja.zona,
        telefone: loja.telefone,
        email: loja.email,
      },
    })

    await prisma.registroMensal.create({
      data: {
        lojaId: criada.id,
        mes: MES_REFERENCIA,
        vendas: loja.vendas,
        validacoes: loja.validacoes,
        origem: 'manual',
      },
    })

    console.log(`Loja criada: ${criada.nome}`)
  }
}

main()
  .then(() => console.log('Seed concluído!'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })