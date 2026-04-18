import { Router } from "express";
import { z } from "zod";

import { CONTACT_PLATFORMS } from "../../constants/site.js";
import { sendCreated, sendSuccess } from "../../lib/http.js";
import { validateRequest } from "../../middleware/validate.js";
import {
  createContactMethod,
  deleteContactMethod,
  getContactMethod,
  listContactMethods,
  updateContactMethod
} from "./contacts.service.js";

const contactSchema = z.object({
  platform: z.enum(CONTACT_PLATFORMS),
  label: z.string().trim().min(2).max(60),
  value: z.string().trim().max(120).optional().nullable(),
  link: z.string().trim().min(1).max(300),
  icon: z.string().trim().min(1).max(60),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0)
});

const contactUpdateSchema = contactSchema.partial();

const contactIdSchema = z.object({
  contactId: z.string().min(1)
});

export const contactsRoutes = Router();

contactsRoutes.get("/", async (_request, response) => {
  const contacts = await listContactMethods();
  sendSuccess(response, contacts);
});

contactsRoutes.post(
  "/",
  validateRequest({ body: contactSchema }),
  async (request, response) => {
    const contact = await createContactMethod(request.body);
    sendCreated(response, contact);
  }
);

contactsRoutes.get(
  "/:contactId",
  validateRequest({ params: contactIdSchema }),
  async (request, response) => {
    const { contactId } = request.params as { contactId: string };
    sendSuccess(response, await getContactMethod(contactId));
  }
);

contactsRoutes.patch(
  "/:contactId",
  validateRequest({ params: contactIdSchema, body: contactUpdateSchema }),
  async (request, response) => {
    const { contactId } = request.params as { contactId: string };
    const contact = await updateContactMethod(contactId, request.body);
    sendSuccess(response, contact);
  }
);

contactsRoutes.delete(
  "/:contactId",
  validateRequest({ params: contactIdSchema }),
  async (request, response) => {
    const { contactId } = request.params as { contactId: string };
    await deleteContactMethod(contactId);
    sendSuccess(response, {
      deleted: true
    });
  }
);
