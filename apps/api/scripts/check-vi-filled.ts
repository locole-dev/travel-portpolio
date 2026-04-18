/**
 * Read-only: report whether *Vi columns look backfilled (non-empty).
 * Usage: npx tsx scripts/check-vi-filled.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const profile = await prisma.profile.findFirst();
  const contacts = await prisma.contactMethod.findMany({
    select: { id: true, label: true, labelVi: true },
    orderBy: { sortOrder: "asc" },
  });
  const homestay = await prisma.homestaySection.findFirst({
    select: {
      titleVi: true,
      previewDescriptionVi: true,
      descriptionVi: true,
      seasonalRatesNoteVi: true,
    },
  });
  const imgVi = await prisma.homestayImage.count({
    where: { altTextVi: { not: "" } },
  });
  const imgTotal = await prisma.homestayImage.count();
  const svcWithVi = await prisma.serviceItem.count({
    where: { titleVi: { not: "" } },
  });
  const svcTotal = await prisma.serviceItem.count();
  const closing = await prisma.closingSection.findFirst({
    select: { titleVi: true, messageVi: true, ctaLabelVi: true },
  });

  const report = {
    profile: profile
      ? {
          fullNameViLen: profile.fullNameVi.length,
          titleViLen: profile.titleVi.length,
          shortIntroViLen: profile.shortIntroVi.length,
          heroPrimaryCtaLabelViLen: profile.heroPrimaryCtaLabelVi.length,
          heroSecondaryCtaLabelViLen: profile.heroSecondaryCtaLabelVi.length,
          titleViPreview: profile.titleVi.slice(0, 60),
        }
      : null,
    contacts: contacts.map((c) => ({
      id: c.id,
      label: c.label,
      labelViLen: c.labelVi.length,
    })),
    homestay: homestay
      ? {
          titleViLen: homestay.titleVi.length,
          previewViLen: homestay.previewDescriptionVi.length,
          descriptionViLen: homestay.descriptionVi.length,
          seasonalRatesNoteViLen: homestay.seasonalRatesNoteVi.length,
        }
      : null,
    homestayImages: { withAltVi: imgVi, total: imgTotal },
    services: { withTitleVi: svcWithVi, total: svcTotal },
    closing: closing
      ? {
          titleViLen: closing.titleVi.length,
          messageViLen: closing.messageVi.length,
          ctaLabelViLen: closing.ctaLabelVi.length,
        }
      : null,
  };

  console.log(JSON.stringify(report, null, 2));

  const emptyProfileVi =
    profile &&
    [
      profile.fullNameVi,
      profile.titleVi,
      profile.shortIntroVi,
      profile.heroPrimaryCtaLabelVi,
      profile.heroSecondaryCtaLabelVi,
    ].every((s) => !s.trim());
  const contactsMissing = contacts.filter((c) => !c.labelVi.trim()).length;
  const summary =
    !profile
      ? "No profile row."
      : [
          emptyProfileVi ? "WARN: all main profile *Vi fields empty" : "OK: profile has some Vi text",
          contactsMissing ? `WARN: ${contactsMissing} contacts with empty labelVi` : "OK: all contacts have labelVi",
          homestay && !homestay.descriptionVi.trim()
            ? "WARN: homestay descriptionVi empty"
            : homestay
              ? "OK: homestay has descriptionVi"
              : "No homestay",
          svcWithVi < svcTotal
            ? `WARN: only ${svcWithVi}/${svcTotal} services have titleVi`
            : `OK: services ${svcWithVi}/${svcTotal}`,
          closing && !closing.messageVi.trim()
            ? "WARN: closing messageVi empty"
            : closing
              ? "OK: closing has Vi"
              : "No closing",
        ].join("\n");

  console.log("\n--- summary ---\n" + summary);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
