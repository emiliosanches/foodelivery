/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "restaurants_email_key" ON "restaurants"("email");
