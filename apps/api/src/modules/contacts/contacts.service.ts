import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";

type ContactInput = {
  platform: string;
  label: string;
  labelVi?: string;
  value?: string | null;
  link: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
};

export async function listContactMethods() {
  return prisma.contactMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });
}

export async function getContactMethod(id: string) {
  const contact = await prisma.contactMethod.findUnique({
    where: { id }
  });

  if (!contact) {
    throw new AppError(404, "CONTACT_NOT_FOUND", "Contact method not found.");
  }

  return contact;
}

export async function listPublicContactMethods() {
  return prisma.contactMethod.findMany({
    where: {
      isActive: true
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });
}

export async function createContactMethod(input: ContactInput) {
  return prisma.contactMethod.create({
    data: {
      platform: input.platform,
      label: input.label,
      labelVi: input.labelVi ?? "",
      value: input.value ?? null,
      link: input.link,
      icon: input.icon,
      isActive: input.isActive,
      sortOrder: input.sortOrder
    }
  });
}

export async function updateContactMethod(id: string, input: Partial<ContactInput>) {
  await getContactMethod(id);

  return prisma.contactMethod.update({
    where: { id },
    data: input
  });
}

export async function deleteContactMethod(id: string) {
  await getContactMethod(id);

  await prisma.contactMethod.delete({
    where: { id }
  });
}
