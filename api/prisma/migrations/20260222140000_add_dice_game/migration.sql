-- CreateEnum
CREATE TYPE "DiceSessionStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED');

-- CreateTable
CREATE TABLE "DiceSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DiceSessionStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiceSessionPlayer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "userId" TEXT,
    "guestId" TEXT,
    "displayName" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiceSessionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiceSessionState" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "currentPlayerSlot" INTEGER NOT NULL,
    "remainingTurns" INTEGER NOT NULL,
    "dices" JSONB NOT NULL,
    "triesLeft" INTEGER NOT NULL,
    "scores" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiceSessionState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiceSessionState_sessionId_key" ON "DiceSessionState"("sessionId");

-- CreateIndex
CREATE INDEX "DiceSessionPlayer_sessionId_idx" ON "DiceSessionPlayer"("sessionId");

-- CreateIndex
CREATE INDEX "DiceSessionPlayer_guestId_idx" ON "DiceSessionPlayer"("guestId");

-- CreateIndex
CREATE INDEX "DiceSessionPlayer_userId_idx" ON "DiceSessionPlayer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiceSessionPlayer_sessionId_slot_key" ON "DiceSessionPlayer"("sessionId", "slot");

-- AddForeignKey
ALTER TABLE "DiceSessionPlayer" ADD CONSTRAINT "DiceSessionPlayer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DiceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiceSessionState" ADD CONSTRAINT "DiceSessionState_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DiceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
