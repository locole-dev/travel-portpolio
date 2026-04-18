-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "heroPrimaryContactId" TEXT,
ADD COLUMN     "heroSecondaryContactId" TEXT;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_heroPrimaryContactId_fkey" FOREIGN KEY ("heroPrimaryContactId") REFERENCES "ContactMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_heroSecondaryContactId_fkey" FOREIGN KEY ("heroSecondaryContactId") REFERENCES "ContactMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
