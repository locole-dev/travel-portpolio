import { PROFILE_ID } from "../../constants/site.js";
import { prisma } from "../../lib/prisma.js";

const defaultProfile = {
  id: PROFILE_ID,
  fullName: "TwentyNine Homestay",
  title: "Local Guide & Homestay Host",
  shortIntro:
    "Warm stays, local rides, and friendly travel support for visitors who want a more personal trip.",
  avatarImage: "/uploads/avatar-host.jpg",
  heroPrimaryCtaLabel: "Chat on WhatsApp",
  heroPrimaryCtaLink: "https://wa.me/855000000000",
  heroSecondaryCtaLabel: "Explore the Homestay",
  heroSecondaryCtaLink: "#homestay"
};

export async function getProfile() {
  return prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {},
    create: defaultProfile
  });
}

export async function updateProfile(input: {
  fullName: string;
  title: string;
  shortIntro: string;
  avatarImage?: string | null;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaLink: string;
}) {
  return prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: input,
    create: {
      ...defaultProfile,
      ...input,
      id: PROFILE_ID
    }
  });
}
