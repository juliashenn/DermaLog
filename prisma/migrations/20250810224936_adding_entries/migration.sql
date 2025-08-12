-- CreateEnum
CREATE TYPE "public"."TimeOfDay" AS ENUM ('am', 'pm');

-- CreateTable
CREATE TABLE "public"."entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products_used" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "area" TEXT,
    "timeOfDay" "public"."TimeOfDay" NOT NULL,

    CONSTRAINT "products_used_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."breakouts" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "breakouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."foods_eaten" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "foodItem" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "foods_eaten_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."entries" ADD CONSTRAINT "entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products_used" ADD CONSTRAINT "products_used_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."breakouts" ADD CONSTRAINT "breakouts_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foods_eaten" ADD CONSTRAINT "foods_eaten_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
