import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { publicRoutes } from "../modules/public/public.routes.js";
import { profileRoutes } from "../modules/profile/profile.routes.js";
import { contactsRoutes } from "../modules/contacts/contacts.routes.js";
import { homestayRoutes } from "../modules/homestay/homestay.routes.js";
import { homestayImagesRoutes } from "../modules/homestay/homestay-images.routes.js";
import { servicesRoutes } from "../modules/services/services.routes.js";
import { closingRoutes } from "../modules/closing/closing.routes.js";
import { mediaRoutes } from "../modules/media/media.routes.js";

export function createRouter() {
  const router = Router();

  router.use("/api/v1/auth", authRoutes);
  router.use("/api/v1/public", publicRoutes);
  router.use("/api/v1/admin/profile", requireAuth, profileRoutes);
  router.use("/api/v1/admin/contacts", requireAuth, contactsRoutes);
  router.use("/api/v1/admin/homestay", requireAuth, homestayRoutes);
  router.use("/api/v1/admin/homestay-images", requireAuth, homestayImagesRoutes);
  router.use("/api/v1/admin/services", requireAuth, servicesRoutes);
  router.use("/api/v1/admin/closing", requireAuth, closingRoutes);
  router.use("/api/v1/admin/media", requireAuth, mediaRoutes);

  return router;
}
