-- DropForeignKey
ALTER TABLE "Map" DROP CONSTRAINT "Map_king_id_fkey";

-- AlterTable
ALTER TABLE "Map" ALTER COLUMN "king_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_king_id_fkey" FOREIGN KEY ("king_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
