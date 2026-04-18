import { Router } from "express";

import { sendSuccess } from "../../lib/http.js";
import { parsePublicLocale } from "../../lib/public-locale.js";
import { prisma } from "../../lib/prisma.js";
import { getClosingSection } from "../closing/closing.service.js";
import { listPublicContactMethods } from "../contacts/contacts.service.js";
import { getPublicHomestayContent } from "../homestay/homestay.service.js";
import { getProfile, materializePublicProfile } from "../profile/profile.service.js";
import { listPublicServiceItems } from "../services/services.service.js";
import {
  localizeClosing,
  localizeContactMethod,
  localizeHomestay,
  localizeServiceItem
} from "./localize-public.js";

export const publicRoutes = Router();

async function loadHeroContactMap(profile: Awaited<ReturnType<typeof getProfile>>) {
  const ids = [profile.heroPrimaryContactId, profile.heroSecondaryContactId].filter(
    (x): x is string => Boolean(x)
  );
  if (ids.length === 0) {
    return new Map();
  }
  const linked = await prisma.contactMethod.findMany({ where: { id: { in: ids } } });
  return new Map(linked.map((c) => [c.id, c]));
}

publicRoutes.get("/site-content", async (request, response) => {
  const locale = parsePublicLocale(request.query as Record<string, unknown>);
  const [profile, contacts, homestay, services, closing] = await Promise.all([
    getProfile(),
    listPublicContactMethods(),
    getPublicHomestayContent(),
    listPublicServiceItems(),
    getClosingSection()
  ]);

  const heroContacts = await loadHeroContactMap(profile);

  sendSuccess(response, {
    profile: materializePublicProfile(profile, heroContacts, locale),
    contacts: contacts.map((c) => localizeContactMethod(c, locale)),
    homestay: localizeHomestay(homestay, locale),
    services: services.map((s) => localizeServiceItem(s, locale)),
    closing: localizeClosing(closing, locale)
  });
});

publicRoutes.get("/profile", async (request, response) => {
  const locale = parsePublicLocale(request.query as Record<string, unknown>);
  const profile = await getProfile();
  const heroContacts = await loadHeroContactMap(profile);
  sendSuccess(response, materializePublicProfile(profile, heroContacts, locale));
});

publicRoutes.get("/contacts", async (request, response) => {
  const locale = parsePublicLocale(request.query as Record<string, unknown>);
  const contacts = await listPublicContactMethods();
  sendSuccess(response, contacts.map((c) => localizeContactMethod(c, locale)));
});

publicRoutes.get("/homestay", async (request, response) => {
  const locale = parsePublicLocale(request.query as Record<string, unknown>);
  const section = await getPublicHomestayContent();
  sendSuccess(response, localizeHomestay(section, locale));
});

publicRoutes.get("/services", async (request, response) => {
  const locale = parsePublicLocale(request.query as Record<string, unknown>);
  const services = await listPublicServiceItems();
  sendSuccess(response, services.map((s) => localizeServiceItem(s, locale)));
});

publicRoutes.get("/closing", async (request, response) => {
  const locale = parsePublicLocale(request.query as Record<string, unknown>);
  const closing = await getClosingSection();
  sendSuccess(response, localizeClosing(closing, locale));
});
