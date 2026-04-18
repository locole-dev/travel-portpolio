import { Router } from "express";

import { sendSuccess } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import { getClosingSection } from "../closing/closing.service.js";
import { listPublicContactMethods } from "../contacts/contacts.service.js";
import { getPublicHomestayContent } from "../homestay/homestay.service.js";
import { getProfile, materializePublicProfile } from "../profile/profile.service.js";
import { listPublicServiceItems } from "../services/services.service.js";

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

publicRoutes.get("/site-content", async (_request, response) => {
  const [profile, contacts, homestay, services, closing] = await Promise.all([
    getProfile(),
    listPublicContactMethods(),
    getPublicHomestayContent(),
    listPublicServiceItems(),
    getClosingSection()
  ]);

  const heroContacts = await loadHeroContactMap(profile);

  sendSuccess(response, {
    profile: materializePublicProfile(profile, heroContacts),
    contacts,
    homestay,
    services,
    closing
  });
});

publicRoutes.get("/profile", async (_request, response) => {
  const profile = await getProfile();
  const heroContacts = await loadHeroContactMap(profile);
  sendSuccess(response, materializePublicProfile(profile, heroContacts));
});

publicRoutes.get("/contacts", async (_request, response) => {
  sendSuccess(response, await listPublicContactMethods());
});

publicRoutes.get("/homestay", async (_request, response) => {
  sendSuccess(response, await getPublicHomestayContent());
});

publicRoutes.get("/services", async (_request, response) => {
  sendSuccess(response, await listPublicServiceItems());
});

publicRoutes.get("/closing", async (_request, response) => {
  sendSuccess(response, await getClosingSection());
});
