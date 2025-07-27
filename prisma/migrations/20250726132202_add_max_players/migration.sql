/*
  Warnings:

  - Added the required column `max_players` to the `GameSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "max_players" INTEGER NOT NULL;
