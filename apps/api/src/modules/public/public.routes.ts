import { Router } from "express";

import { sendSuccess } from "../../lib/http.js";
import { getClosingSection } from "../closing/closing.service.js";
import { listPublicContactMethods } from "../contacts/contacts.service.js";
import { getPublicHomestayContent } from "../homestay/homestay.service.js";
import { getProfile } from "../profile/profile.service.js";
import { listPublicServiceItems } from "../services/services.service.js";

export const publicRoutes = Router();

publicRoutes.get("/site-content", async (_request, response) => {
  const [profile, contacts, homestay, services, closing] = await Promise.all([
    getProfile(),
    listPublicContactMethods(),
    getPublicHomestayContent(),
    listPublicServiceItems(),
    getClosingSection()
  ]);

  sendSuccess(response, {
    profile,
    contacts,
    homestay,
    services,
    closing
  });
});

publicRoutes.get("/profile", async (_request, response) => {
  sendSuccess(response, await getProfile());
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
