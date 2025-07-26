-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('WAIT', 'RUN', 'END');

-- CreateEnum
CREATE TYPE "TileType" AS ENUM ('DRINK', 'MOVE', 'BLOCK', 'CUSTOM', 'CARD');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Map" (
    "id" SERIAL NOT NULL,
    "king_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "is_builtin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapTile" (
    "id" SERIAL NOT NULL,
    "map_id" INTEGER NOT NULL,
    "idx" INTEGER NOT NULL,
    "tile_type" "TileType" NOT NULL,
    "description" TEXT,
    "default_action" JSONB,

    CONSTRAINT "MapTile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" SERIAL NOT NULL,
    "map_id" INTEGER NOT NULL,
    "king_id" INTEGER NOT NULL,
    "join_code" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'WAIT',
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "guest_id" TEXT,
    "join_order" INTEGER NOT NULL,
    "current_pos" INTEGER NOT NULL,
    "total_drink" INTEGER NOT NULL DEFAULT 0,
    "is_out" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turn" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "turn_no" INTEGER NOT NULL,
    "dice" INTEGER NOT NULL,
    "from_pos" INTEGER NOT NULL,
    "to_pos" INTEGER NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "Turn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TileEvent" (
    "id" SERIAL NOT NULL,
    "turn_id" INTEGER NOT NULL,
    "tile_id" INTEGER NOT NULL,
    "action_result" JSONB NOT NULL,

    CONSTRAINT "TileEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_join_code_key" ON "GameSession"("join_code");

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_king_id_fkey" FOREIGN KEY ("king_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapTile" ADD CONSTRAINT "MapTile_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_king_id_fkey" FOREIGN KEY ("king_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TileEvent" ADD CONSTRAINT "TileEvent_turn_id_fkey" FOREIGN KEY ("turn_id") REFERENCES "Turn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TileEvent" ADD CONSTRAINT "TileEvent_tile_id_fkey" FOREIGN KEY ("tile_id") REFERENCES "MapTile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
