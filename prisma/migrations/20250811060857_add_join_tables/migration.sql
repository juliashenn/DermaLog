/*
  Warnings:

  - You are about to drop the `products_used` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."products_used" DROP CONSTRAINT "products_used_entryId_fkey";

-- DropTable
DROP TABLE "public"."products_used";

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "UserProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntryProduct" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "area" TEXT,
    "timeOfDay" "public"."TimeOfDay" NOT NULL,

    CONSTRAINT "EntryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProduct_userId_productId_key" ON "public"."UserProduct"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryProduct_entryId_productId_key" ON "public"."EntryProduct"("entryId", "productId");

-- AddForeignKey
ALTER TABLE "public"."UserProduct" ADD CONSTRAINT "UserProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProduct" ADD CONSTRAINT "UserProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntryProduct" ADD CONSTRAINT "EntryProduct_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntryProduct" ADD CONSTRAINT "EntryProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
