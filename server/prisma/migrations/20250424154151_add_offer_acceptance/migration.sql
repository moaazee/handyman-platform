-- AlterTable
ALTER TABLE "JobRequest" ADD COLUMN     "taken" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;
