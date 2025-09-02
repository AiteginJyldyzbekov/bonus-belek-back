/*
  Warnings:

  - You are about to drop the column `idUser` on the `OTP` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `code` to the `OTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `OTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `OTP` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."OTP" DROP CONSTRAINT "OTP_id_fkey";

-- AlterTable
ALTER TABLE "public"."OTP" DROP COLUMN "idUser",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "password";

-- AddForeignKey
ALTER TABLE "public"."OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
