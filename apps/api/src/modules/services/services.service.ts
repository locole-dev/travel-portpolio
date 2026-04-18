import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";

type ServiceInput = {
  title: string;
  description: string;
  icon: string;
  ctaLabel?: string | null;
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
    data: input
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
