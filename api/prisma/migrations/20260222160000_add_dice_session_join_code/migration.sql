-- AlterTable
ALTER TABLE "DiceSession" ADD COLUMN "joinCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DiceSession_joinCode_key" ON "DiceSession"("joinCode");
