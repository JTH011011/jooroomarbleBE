/*
  Warnings:

  - The values [MOVE,BLOCK,CARD] on the enum `TileType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TileType_new" AS ENUM ('START', 'DRINK', 'CUSTOM');
ALTER TABLE "MapTile" ALTER COLUMN "tile_type" TYPE "TileType_new" USING ("tile_type"::text::"TileType_new");
ALTER TYPE "TileType" RENAME TO "TileType_old";
ALTER TYPE "TileType_new" RENAME TO "TileType";
DROP TYPE "TileType_old";
COMMIT;
