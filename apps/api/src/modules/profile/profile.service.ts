import type { ContactMethod } from "@prisma/client";

import { PROFILE_ID } from "../../constants/site.js";
import { contactCtaLabel } from "../../lib/contact-cta-label.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { pickLocalized, type PublicLocale } from "../../lib/public-locale.js";

const defaultProfile = {
  id: PROFILE_ID,
  fullName: "TwentyNine Homestay",
  fullNameVi: "",
  title: "Local Guide & Homestay Host",
  titleVi: "",
  shortIntro:
    "Warm stays, local rides, and friendly travel support for visitors who want a more personal trip.",
  shortIntroVi: "",
  avatarImage: "/uploads/avatar-host.jpg",
  heroPrimaryCtaLabel: "Chat on WhatsApp",
  heroPrimaryCtaLabelVi: "",
  heroPrimaryCtaLink: "https://wa.me/855000000000",
  heroSecondaryCtaLabel: "Explore the Homestay",
  heroSecondaryCtaLabelVi: "",
  heroSecondaryCtaLink: "#homestay",
  heroPrimaryContactId: null as string | null,
  heroSecondaryContactId: null as string | null
};

export async function getProfile() {
  return prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {},
    create: defaultProfile
  });
}

/** Strips FKs, Vi columns, and applies live contact label/link when the linked contact is active. */
export function materializePublicProfile(
  profile: Awaited<ReturnType<typeof getProfile>>,
  contactsById: Map<string, ContactMethod>,
  locale: PublicLocale
) {
  let heroPrimaryCtaLabel = pickLocalized(
    profile.heroPrimaryCtaLabel,
    profile.heroPrimaryCtaLabelVi,
    locale
  );
  let heroPrimaryCtaLink = profile.heroPrimaryCtaLink;
  if (profile.heroPrimaryContactId) {
    const c = contactsById.get(profile.heroPrimaryContactId);
    if (c?.isActive) {
      const viOverride = (profile.heroPrimaryCtaLabelVi ?? "").trim();
      heroPrimaryCtaLabel =
        locale === "vi" && viOverride.length > 0 ? viOverride : contactCtaLabel(c, locale);
      heroPrimaryCtaLink = c.link;
    }
  }

  let heroSecondaryCtaLabel = pickLocalized(
    profile.heroSecondaryCtaLabel,
    profile.heroSecondaryCtaLabelVi,
    locale
  );
  let heroSecondaryCtaLink = profile.heroSecondaryCtaLink;
  if (profile.heroSecondaryContactId) {
    const c = contactsById.get(profile.heroSecondaryContactId);
    if (c?.isActive) {
      const viOverride = (profile.heroSecondaryCtaLabelVi ?? "").trim();
      heroSecondaryCtaLabel =
        locale === "vi" && viOverride.length > 0 ? viOverride : contactCtaLabel(c, locale);
      heroSecondaryCtaLink = c.link;
    }
  }

  const out = {
    id: profile.id,
    fullName: pickLocalized(profile.fullName, profile.fullNameVi, locale),
    title: pickLocalized(profile.title, profile.titleVi, locale),
    shortIntro: pickLocalized(profile.shortIntro, profile.shortIntroVi, locale),
    avatarImage: profile.avatarImage,
    heroPrimaryCtaLabel,
    heroPrimaryCtaLink,
    heroSecondaryCtaLabel,
    heroSecondaryCtaLink
  };
  return out;
}

export async function updateProfile(input: {
  fullName: string;
  fullNameVi?: string;
  title: string;
  titleVi?: string;
  shortIntro: string;
  shortIntroVi?: string;
  avatarImage?: string | null;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaLabelVi?: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaLabelVi?: string;
  heroSecondaryCtaLink: string;
  heroPrimaryContactId: string | null;
  heroSecondaryContactId: string | null;
}) {
  const primaryId = input.heroPrimaryContactId;
  const secondaryId = input.heroSecondaryContactId;

  const idsToVerify = [...new Set([primaryId, secondaryId].filter((x): x is string => Boolean(x)))];
  if (idsToVerify.length > 0) {
    const found = await prisma.contactMethod.findMany({
      where: { id: { in: idsToVerify } },
      select: { id: true }
    });
    if (found.length !== idsToVerify.length) {
      throw new AppError(422, "CONTACT_NOT_FOUND", "One or more hero contact IDs are invalid.");
    }
  }

  let heroPrimaryCtaLabel = input.heroPrimaryCtaLabel;
  let heroPrimaryCtaLink = input.heroPrimaryCtaLink;
  if (primaryId) {
    const c = await prisma.contactMethod.findUnique({ where: { id: primaryId } });
    if (c) {
      heroPrimaryCtaLabel = contactCtaLabel(c, "en");
      heroPrimaryCtaLink = c.link;
    }
  }

  let heroSecondaryCtaLabel = input.heroSecondaryCtaLabel;
  let heroSecondaryCtaLink = input.heroSecondaryCtaLink;
  if (secondaryId) {
    const c = await prisma.contactMethod.findUnique({ where: { id: secondaryId } });
    if (c) {
      heroSecondaryCtaLabel = contactCtaLabel(c, "en");
      heroSecondaryCtaLink = c.link;
    }
  }

  return prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {
      fullName: input.fullName,
      fullNameVi: input.fullNameVi ?? "",
      title: input.title,
      titleVi: input.titleVi ?? "",
      shortIntro: input.shortIntro,
      shortIntroVi: input.shortIntroVi ?? "",
      avatarImage: input.avatarImage ?? null,
      heroPrimaryCtaLabel,
      heroPrimaryCtaLabelVi: input.heroPrimaryCtaLabelVi ?? "",
      heroPrimaryCtaLink,
      heroSecondaryCtaLabel,
      heroSecondaryCtaLabelVi: input.heroSecondaryCtaLabelVi ?? "",
      heroSecondaryCtaLink,
      heroPrimaryContactId: primaryId,
      heroSecondaryContactId: secondaryId
    },
    create: {
      ...defaultProfile,
      fullName: input.fullName,
      fullNameVi: input.fullNameVi ?? "",
      title: input.title,
      titleVi: input.titleVi ?? "",
      shortIntro: input.shortIntro,
      shortIntroVi: input.shortIntroVi ?? "",
      avatarImage: input.avatarImage ?? defaultProfile.avatarImage,
      heroPrimaryCtaLabel,
      heroPrimaryCtaLabelVi: input.heroPrimaryCtaLabelVi ?? "",
      heroPrimaryCtaLink,
      heroSecondaryCtaLabel,
      heroSecondaryCtaLabelVi: input.heroSecondaryCtaLabelVi ?? "",
      heroSecondaryCtaLink,
      heroPrimaryContactId: primaryId,
      heroSecondaryContactId: secondaryId,
      id: PROFILE_ID
    }
  });
}
