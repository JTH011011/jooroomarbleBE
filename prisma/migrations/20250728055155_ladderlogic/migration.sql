/*
  Warnings:

  - You are about to drop the column `current_pos` on the `Participant` table. All the data in the column will be lost.
  - Added the required column `current_pos` to the `GameSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "current_pos" INTEGER NOT NULL,
ADD COLUMN     "is_on_ladder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "current_pos";
