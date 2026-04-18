import { Router } from "express";
import { z } from "zod";

import { sendCreated, sendSuccess } from "../../lib/http.js";
import { validateRequest } from "../../middleware/validate.js";
import {
  createServiceItem,
  deleteServiceItem,
  getServiceItem,
  listServiceItems,
  updateServiceItem
} from "./services.service.js";

const serviceSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(280),
  icon: z.string().trim().min(1).max(60),
  ctaLabel: z.string().trim().max(60).optional().nullable(),
  ctaLink: z.string().trim().max(300).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0)
});

const serviceUpdateSchema = serviceSchema.partial();
const serviceIdSchema = z.object({
  serviceId: z.string().min(1)
});

export const servicesRoutes = Router();

servicesRoutes.get("/", async (_request, response) => {
  sendSuccess(response, await listServiceItems());
});

servicesRoutes.post(
  "/",
  validateRequest({ body: serviceSchema }),
  async (request, response) => {
    sendCreated(response, await createServiceItem(request.body));
  }
);

servicesRoutes.get(
  "/:serviceId",
  validateRequest({ params: serviceIdSchema }),
  async (request, response) => {
    const { serviceId } = request.params as { serviceId: string };
    sendSuccess(response, await getServiceItem(serviceId));
  }
);

servicesRoutes.patch(
  "/:serviceId",
  validateRequest({ params: serviceIdSchema, body: serviceUpdateSchema }),
  async (request, response) => {
    const { serviceId } = request.params as { serviceId: string };
    sendSuccess(
      response,
      await updateServiceItem(serviceId, request.body)
    );
  }
);

servicesRoutes.delete(
  "/:serviceId",
  validateRequest({ params: serviceIdSchema }),
  async (request, response) => {
    const { serviceId } = request.params as { serviceId: string };
    await deleteServiceItem(serviceId);
    sendSuccess(response, { deleted: true });
  }
);
