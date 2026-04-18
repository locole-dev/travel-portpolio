import { contactCtaLabel } from "./contact-cta-label";
import { pickLocalized, pickLocalizedNullable, type PublicLocale } from "./public-locale";
import type {
  ClosingSection,
  ContactMethod,
  HomestaySection,
  Profile,
  ServiceItem,
  SiteContent
} from "../types/content";

type BilingualState = {
  profile: Profile;
  contacts: ContactMethod[];
  homestay: HomestaySection;
  services: ServiceItem[];
  closing: ClosingSection;
};

function materializePublicProfile(profile: Profile, contacts: ContactMethod[], locale: PublicLocale) {
  const byId = new Map(contacts.map((c) => [c.id, c]));

  let heroPrimaryCtaLabel = pickLocalized(
    profile.heroPrimaryCtaLabel,
    profile.heroPrimaryCtaLabelVi,
    locale
  );
  let heroPrimaryCtaLink = profile.heroPrimaryCtaLink;
  if (profile.heroPrimaryContactId) {
    const c = byId.get(profile.heroPrimaryContactId);
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
    const c = byId.get(profile.heroSecondaryContactId);
    if (c?.isActive) {
      const viOverride = (profile.heroSecondaryCtaLabelVi ?? "").trim();
      heroSecondaryCtaLabel =
        locale === "vi" && viOverride.length > 0 ? viOverride : contactCtaLabel(c, locale);
      heroSecondaryCtaLink = c.link;
    }
  }

  return {
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
}

function localizeContact(c: ContactMethod, locale: PublicLocale): ContactMethod {
  return {
    id: c.id,
    platform: c.platform,
    label: pickLocalized(c.label, c.labelVi, locale),
    value: c.value,
    link: c.link,
    icon: c.icon,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  };
}

function localizeHomestay(section: HomestaySection, locale: PublicLocale): HomestaySection | null {
  if (!section.isActive) return null;

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
      section.locationLabelVi,
      locale
    ),
    seasonalRatesNote: pickLocalizedNullable(
      section.seasonalRatesNote,
      section.seasonalRatesNoteVi,
      locale
    ),
    images: [...section.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        id: img.id,
        homestaySectionId: img.homestaySectionId,
        imageUrl: img.imageUrl,
        altText: pickLocalized(img.altText, img.altTextVi, locale),
        sortOrder: img.sortOrder,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt
      }))
  };
}

function localizeService(s: ServiceItem, locale: PublicLocale): ServiceItem {
  return {
    id: s.id,
    title: pickLocalized(s.title, s.titleVi, locale),
    description: pickLocalized(s.description, s.descriptionVi, locale),
    icon: s.icon,
    ctaLabel: pickLocalizedNullable(s.ctaLabel, s.ctaLabelVi, locale),
    ctaLink: s.ctaLink,
    isActive: s.isActive,
    sortOrder: s.sortOrder
  };
}

function localizeClosing(c: ClosingSection, locale: PublicLocale): ClosingSection {
  return {
    id: c.id,
    title: pickLocalized(c.title, c.titleVi, locale),
    message: pickLocalized(c.message, c.messageVi, locale),
    ctaLabel: pickLocalized(c.ctaLabel, c.ctaLabelVi, locale),
    ctaLink: c.ctaLink
  };
}

/** Match API public site-content for mock mode. */
export function localizeSiteContent(state: BilingualState, locale: PublicLocale): SiteContent {
  return {
    profile: materializePublicProfile(state.profile, state.contacts, locale),
    contacts: state.contacts
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => localizeContact(c, locale)),
    homestay: localizeHomestay(state.homestay, locale),
    services: state.services
      .filter((s) => s.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => localizeService(s, locale)),
    closing: localizeClosing(state.closing, locale)
  };
}
