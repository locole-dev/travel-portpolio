-- AlterTable
ALTER TABLE "ClosingSection" ADD COLUMN     "ctaLabelVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "messageVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titleVi" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ContactMethod" ADD COLUMN     "labelVi" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "HomestayImage" ADD COLUMN     "altTextVi" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "HomestaySection" ADD COLUMN     "descriptionVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "locationLabelVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "previewDescriptionVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seasonalRatesNoteVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titleVi" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "fullNameVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "heroPrimaryCtaLabelVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "heroSecondaryCtaLabelVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shortIntroVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titleVi" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ServiceItem" ADD COLUMN     "ctaLabelVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "descriptionVi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titleVi" TEXT NOT NULL DEFAULT '';
