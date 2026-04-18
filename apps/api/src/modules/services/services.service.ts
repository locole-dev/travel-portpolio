import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";

type ServiceInput = {
  title: string;
  titleVi?: string;
  description: string;
  descriptionVi?: string;
  icon: string;
  ctaLabel?: string | null;
  ctaLabelVi?: string;
  ctaLink?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export async function listServiceItems() {
  return prisma.serviceItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });
}

export async function getServiceItem(id: string) {
  const service = await prisma.serviceItem.findUnique({
    where: { id }
  });

  if (!service) {
    throw new AppError(404, "SERVICE_NOT_FOUND", "Service item not found.");
  }

  return service;
}

export async function listPublicServiceItems() {
  return prisma.serviceItem.findMany({
    where: {
      isActive: true
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });
}

export async function createServiceItem(input: ServiceInput) {
  return prisma.serviceItem.create({
    data: {
      title: input.title,
      titleVi: input.titleVi ?? "",
      description: input.description,
      descriptionVi: input.descriptionVi ?? "",
      icon: input.icon,
      ctaLabel: input.ctaLabel ?? null,
      ctaLabelVi: input.ctaLabelVi ?? "",
      ctaLink: input.ctaLink ?? null,
      isActive: input.isActive,
      sortOrder: input.sortOrder
    }
  });
}

export async function updateServiceItem(id: string, input: Partial<ServiceInput>) {
  await getServiceItem(id);

  return prisma.serviceItem.update({
    where: { id },
    data: input
  });
}

export async function deleteServiceItem(id: string) {
  await getServiceItem(id);

  await prisma.serviceItem.delete({
    where: { id }
  });
}
