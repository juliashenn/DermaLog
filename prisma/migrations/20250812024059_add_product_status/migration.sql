-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('CURRENT', 'TRIED', 'WANT_TO_TRY');

-- AlterTable
ALTER TABLE "public"."UserProduct" ADD COLUMN     "status" "public"."ProductStatus" NOT NULL DEFAULT 'CURRENT';
