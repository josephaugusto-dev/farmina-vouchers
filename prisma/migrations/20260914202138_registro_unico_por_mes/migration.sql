/*
  Warnings:

  - A unique constraint covering the columns `[lojaId,mes]` on the table `RegistroMensal` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RegistroMensal_lojaId_mes_idx";

-- CreateIndex
CREATE UNIQUE INDEX "RegistroMensal_lojaId_mes_key" ON "RegistroMensal"("lojaId", "mes");
