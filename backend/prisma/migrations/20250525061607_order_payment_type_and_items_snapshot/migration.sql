/*
  Warnings:

  - The values [PIX,CASH] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `brand` on the `payment_methods` table. All the data in the column will be lost.
  - You are about to drop the column `card_number` on the `payment_methods` table. All the data in the column will be lost.
  - Added the required column `product_name` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_type` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_four_digits` to the `payment_methods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_payment_method_id` to the `payment_methods` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderPaymentType" AS ENUM ('STORED_CARD', 'PIX', 'CASH');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentType_new" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD');
ALTER TABLE "payment_methods" ALTER COLUMN "type" TYPE "PaymentType_new" USING ("type"::text::"PaymentType_new");
ALTER TYPE "PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "PaymentType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_payment_method_id_fkey";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "product_description" TEXT,
ADD COLUMN     "product_image_url" TEXT,
ADD COLUMN     "product_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_data" JSONB,
ADD COLUMN     "payment_type" "OrderPaymentType" NOT NULL,
ALTER COLUMN "payment_method_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "brand",
DROP COLUMN "card_number",
ADD COLUMN     "card_brand" TEXT,
ADD COLUMN     "last_four_digits" TEXT NOT NULL,
ADD COLUMN     "provider_payment_method_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
