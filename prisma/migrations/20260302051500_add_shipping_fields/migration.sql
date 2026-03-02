-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "shippingAddress" TEXT,
ADD COLUMN "shippingCity" TEXT,
ADD COLUMN "shippingDepartment" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";
