/*
  Warnings:

  - The values [PICKING_UP,DELIVERING,CANCELLED] on the enum `DeliveryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [WALKING] on the enum `VehicleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `notes` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `document` on the `delivery_persons` table. All the data in the column will be lost.
  - You are about to drop the column `document_type` on the `delivery_persons` table. All the data in the column will be lost.
  - You are about to drop the column `driver_license` on the `delivery_persons` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `delivery_persons` table. All the data in the column will be lost.
  - You are about to drop the column `is_available` on the `delivery_persons` table. All the data in the column will be lost.
  - You are about to drop the `delivery_tracking` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DeliveryPersonAvailability" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED');
ALTER TABLE "deliveries" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "deliveries" ALTER COLUMN "status" TYPE "DeliveryStatus_new" USING ("status"::text::"DeliveryStatus_new");
ALTER TYPE "DeliveryStatus" RENAME TO "DeliveryStatus_old";
ALTER TYPE "DeliveryStatus_new" RENAME TO "DeliveryStatus";
DROP TYPE "DeliveryStatus_old";
ALTER TABLE "deliveries" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('MOTORCYCLE', 'BICYCLE', 'CAR');
ALTER TABLE "delivery_persons" ALTER COLUMN "vehicle_type" TYPE "VehicleType_new" USING ("vehicle_type"::text::"VehicleType_new");
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "delivery_tracking" DROP CONSTRAINT "delivery_tracking_delivery_id_fkey";

-- DropIndex
DROP INDEX "delivery_persons_document_key";

-- AlterTable
ALTER TABLE "deliveries" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "delivery_persons" DROP COLUMN "document",
DROP COLUMN "document_type",
DROP COLUMN "driver_license",
DROP COLUMN "is_active",
DROP COLUMN "is_available",
ADD COLUMN     "availability" "DeliveryPersonAvailability" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "delivery_radius" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
ADD COLUMN     "last_online_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "delivery_tracking";
