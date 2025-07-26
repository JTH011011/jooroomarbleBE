/*
  Warnings:

  - You are about to drop the column `total_drink` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[map_id,idx]` on the table `MapTile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `guest_id` on table `Participant` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_guest_id_fkey";

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "total_drink",
ALTER COLUMN "guest_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_hash",
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MapTile_map_id_idx_key" ON "MapTile"("map_id", "idx");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
