import { CLOSING_SECTION_ID } from "../../constants/site.js";
import { prisma } from "../../lib/prisma.js";

const defaultClosing = {
  id: CLOSING_SECTION_ID,
  title: "Thank You for Visiting",
  titleVi: "",
  message:
    "If you need a room, a ride, or a trusted local guide, I would be happy to help you plan a smooth and memorable stay.",
  messageVi: "",
  ctaLabel: "Send a Message",
  ctaLabelVi: "",
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
  titleVi?: string;
  message: string;
  messageVi?: string;
  ctaLabel: string;
  ctaLabelVi?: string;
  ctaLink: string;
}) {
  const data = {
    title: input.title,
    titleVi: input.titleVi ?? "",
    message: input.message,
    messageVi: input.messageVi ?? "",
    ctaLabel: input.ctaLabel,
    ctaLabelVi: input.ctaLabelVi ?? "",
    ctaLink: input.ctaLink
  };

  return prisma.closingSection.upsert({
    where: { id: CLOSING_SECTION_ID },
    update: data,
    create: {
      ...defaultClosing,
      ...data
    }
  });
}
