import type { ClosingSection, ContactMethod, HomestayImage, HomestaySection, ServiceItem } from "@prisma/client";

import { pickLocalized, pickLocalizedNullable, type PublicLocale } from "../../lib/public-locale.js";
import { materializePublicProfile } from "../profile/profile.service.js";

type ProfilePublic = ReturnType<typeof materializePublicProfile>;

type HomestayWithImages = HomestaySection & { images: HomestayImage[] };

export function localizeContactMethod(contact: ContactMethod, locale: PublicLocale): Omit<ContactMethod, "labelVi"> {
  return {
    id: contact.id,
    platform: contact.platform,
    label: pickLocalized(contact.label, contact.labelVi, locale),
    value: contact.value,
    link: contact.link,
    icon: contact.icon,
    isActive: contact.isActive,
    sortOrder: contact.sortOrder,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  };
}

export function localizeServiceItem(item: ServiceItem, locale: PublicLocale) {
  return {
    id: item.id,
    title: pickLocalized(item.title, item.titleVi, locale),
    description: pickLocalized(item.description, item.descriptionVi, locale),
    icon: item.icon,
    ctaLabel: pickLocalizedNullable(item.ctaLabel, item.ctaLabelVi || null, locale),
    ctaLink: item.ctaLink,
    isActive: item.isActive,
    sortOrder: item.sortOrder
  };
}

export function localizeClosing(section: ClosingSection, locale: PublicLocale) {
  return {
    id: section.id,
    title: pickLocalized(section.title, section.titleVi, locale),
    message: pickLocalized(section.message, section.messageVi, locale),
    ctaLabel: pickLocalized(section.ctaLabel, section.ctaLabelVi, locale),
    ctaLink: section.ctaLink
  };
}

export function localizeHomestay(section: HomestayWithImages | null, locale: PublicLocale) {
  if (!section || !section.isActive) {
    return null;
  }

  return {
    id: section.id,
    title: pickLocalized(section.title, section.titleVi, locale),
    previewDescription: pickLocalized(section.previewDescription, section.previewDescriptionVi, locale),
    description: pickLocalized(section.description, section.descriptionVi, locale),
    isActive: section.isActive,
    latitude: section.latitude,
    longitude: section.longitude,
    locationLabel: pickLocalizedNullable(
      section.locationLabel,
      section.locationLabelVi || null,
      locale
    ),
    seasonalRatesNote: pickLocalizedNullable(
      section.seasonalRatesNote,
      section.seasonalRatesNoteVi || null,
      locale
    ),
    images: [...section.images]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime())
      .map((img) => ({
        id: img.id,
        homestaySectionId: img.homestaySectionId,
        imageUrl: img.imageUrl,
        altText: pickLocalized(img.altText, img.altTextVi, locale),
        sortOrder: img.sortOrder,
        createdAt: img.createdAt.toISOString(),
        updatedAt: img.updatedAt.toISOString()
      }))
  };
}

export type LocalizedSiteContent = {
  profile: ProfilePublic;
  contacts: ReturnType<typeof localizeContactMethod>[];
  homestay: ReturnType<typeof localizeHomestay>;
  services: ReturnType<typeof localizeServiceItem>[];
  closing: ReturnType<typeof localizeClosing>;
};
