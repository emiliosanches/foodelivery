/*
  Warnings:

  - You are about to drop the column `restaurant_id` on the `addresses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[address_id]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address_id` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_restaurant_id_fkey";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "restaurant_id";

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "address_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_address_id_key" ON "restaurants"("address_id");

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
