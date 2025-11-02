-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colors" TEXT[],
ADD COLUMN     "offerPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "sizes" TEXT[];
