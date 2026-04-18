-- CreateEnum
CREATE TYPE "HomestayMediaKind" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "HomestayImage" ADD COLUMN     "mediaKind" "HomestayMediaKind" NOT NULL DEFAULT 'IMAGE';
