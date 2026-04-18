import type { ContactMethod } from "@prisma/client";

import { PROFILE_ID } from "../../constants/site.js";
import { contactCtaLabel } from "../../lib/contact-cta-label.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

const defaultProfile = {
  id: PROFILE_ID,
  fullName: "TwentyNine Homestay",
  title: "Local Guide & Homestay Host",
  shortIntro:
    "Warm stays, local rides, and friendly travel support for visitors who want a more personal trip.",
  avatarImage: "/uploads/avatar-host.jpg",
  heroPrimaryCtaLabel: "Chat on WhatsApp",
  heroPrimaryCtaLink: "https://wa.me/855000000000",
  heroSecondaryCtaLabel: "Explore the Homestay",
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

/** Strips FKs and applies live contact label/link when the linked contact is active. */
export function materializePublicProfile(
  profile: Awaited<ReturnType<typeof getProfile>>,
  contactsById: Map<string, ContactMethod>
) {
  let heroPrimaryCtaLabel = profile.heroPrimaryCtaLabel;
  let heroPrimaryCtaLink = profile.heroPrimaryCtaLink;
  if (profile.heroPrimaryContactId) {
    const c = contactsById.get(profile.heroPrimaryContactId);
    if (c?.isActive) {
      heroPrimaryCtaLabel = contactCtaLabel(c);
      heroPrimaryCtaLink = c.link;
    }
  }

  let heroSecondaryCtaLabel = profile.heroSecondaryCtaLabel;
  let heroSecondaryCtaLink = profile.heroSecondaryCtaLink;
  if (profile.heroSecondaryContactId) {
    const c = contactsById.get(profile.heroSecondaryContactId);
    if (c?.isActive) {
      heroSecondaryCtaLabel = contactCtaLabel(c);
      heroSecondaryCtaLink = c.link;
    }
  }

  const {
    heroPrimaryContactId: _primaryFk,
    heroSecondaryContactId: _secondaryFk,
    ...rest
  } = profile;

  return {
    ...rest,
    heroPrimaryCtaLabel,
    heroPrimaryCtaLink,
    heroSecondaryCtaLabel,
    heroSecondaryCtaLink
  };
}

export async function updateProfile(input: {
  fullName: string;
  title: string;
  shortIntro: string;
  avatarImage?: string | null;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaLabel: string;
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
      heroPrimaryCtaLabel = contactCtaLabel(c);
      heroPrimaryCtaLink = c.link;
    }
  }

  let heroSecondaryCtaLabel = input.heroSecondaryCtaLabel;
  let heroSecondaryCtaLink = input.heroSecondaryCtaLink;
  if (secondaryId) {
    const c = await prisma.contactMethod.findUnique({ where: { id: secondaryId } });
    if (c) {
      heroSecondaryCtaLabel = contactCtaLabel(c);
      heroSecondaryCtaLink = c.link;
    }
  }

  return prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {
      fullName: input.fullName,
      title: input.title,
      shortIntro: input.shortIntro,
      avatarImage: input.avatarImage ?? null,
      heroPrimaryCtaLabel,
      heroPrimaryCtaLink,
      heroSecondaryCtaLabel,
      heroSecondaryCtaLink,
      heroPrimaryContactId: primaryId,
      heroSecondaryContactId: secondaryId
    },
    create: {
      ...defaultProfile,
      fullName: input.fullName,
      title: input.title,
      shortIntro: input.shortIntro,
      avatarImage: input.avatarImage ?? defaultProfile.avatarImage,
      heroPrimaryCtaLabel,
      heroPrimaryCtaLink,
      heroSecondaryCtaLabel,
      heroSecondaryCtaLink,
      heroPrimaryContactId: primaryId,
      heroSecondaryContactId: secondaryId,
      id: PROFILE_ID
    }
  });
}
