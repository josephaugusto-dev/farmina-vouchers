-- CreateTable
CREATE TABLE "Loja" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "vendedor" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "zona" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroMensal" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "vendas" INTEGER,
    "validacoes" INTEGER NOT NULL,
    "origem" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroMensal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaMensal" (
    "id" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "MetaMensal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroMensal_lojaId_mes_idx" ON "RegistroMensal"("lojaId", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "MetaMensal_mes_key" ON "MetaMensal"("mes");

-- AddForeignKey
ALTER TABLE "RegistroMensal" ADD CONSTRAINT "RegistroMensal_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
