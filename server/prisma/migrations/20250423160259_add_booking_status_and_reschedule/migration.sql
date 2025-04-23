-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "rescheduledAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
