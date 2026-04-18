import { CLOSING_SECTION_ID } from "../../constants/site.js";
import { prisma } from "../../lib/prisma.js";

const defaultClosing = {
  id: CLOSING_SECTION_ID,
  title: "Thank You for Visiting",
  message:
    "If you need a room, a ride, or a trusted local guide, I would be happy to help you plan a smooth and memorable stay.",
  ctaLabel: "Send a Message",
  ctaLink: "https://wa.me/855000000000"
};

export async function getClosingSection() {
  return prisma.closingSection.upsert({
    where: { id: CLOSING_SECTION_ID },
    update: {},
    create: defaultClosing
  });
}

export async function updateClosingSection(input: {
  title: string;
  message: string;
  ctaLabel: string;
  ctaLink: string;
}) {
  return prisma.closingSection.upsert({
    where: { id: CLOSING_SECTION_ID },
    update: input,
    create: {
      ...defaultClosing,
      ...input
    }
  });
}
