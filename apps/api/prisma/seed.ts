import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function omitKeys<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out as Omit<T, K>;
}

/** Re-seed updates English (and structure) but must not wipe *Vi filled by admin or backfill. */
const PROFILE_ID = "profile_singleton";
const HOMESTAY_SECTION_ID = "homestay_singleton";
const CLOSING_SECTION_ID = "closing_singleton";

/** Kept in sync with `createDefaultMockState()` in apps/web/src/lib/mock-api.ts */
const profileData = {
  id: PROFILE_ID,
  fullName: "Nguyen Thanh Hoang",
  fullNameVi: "",
  title: "Nguyen Thanh Hoang",
  titleVi: "",
  shortIntro:
    "I help travelers feel comfortable from the moment they arrive, with a warm homestay, local rides, and personal support for planning around the city.",
  shortIntroVi: "",
  avatarImage:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
  heroPrimaryCtaLabel: "Chat on WhatsApp",
  heroPrimaryCtaLabelVi: "",
  heroPrimaryCtaLink: "https://wa.me/855000000000",
  heroSecondaryCtaLabel: "See the Homestay",
  heroSecondaryCtaLabelVi: "",
  heroSecondaryCtaLink: "#homestay",
  heroPrimaryContactId: "contact-whatsapp",
  heroSecondaryContactId: null
};

const homestayPreview =
  "A friendly place to stay with soft colors, local warmth, and easy transport support for guests arriving for a short visit or a longer trip.";

const homestayFullDescription = `A colorful, welcoming home base for travelers who want comfort, local connection, and easy access to transport support.

The house sits a few steps from the main street but far enough that evenings feel quieter. Mornings start with light through the east-facing window—soft, not harsh—so you can ease into the day without an alarm.

Downstairs is a shared kitchen and a long dining table where we leave hot tea, crisp bread, and a few slim books, like inviting a friend home rather than checking into a hotel.

Bedrooms stay minimal: a wide bed, cotton sheets, soft pillows, and a reading lamp. The bathroom is compact and spotless, with steady hot water and gentle, unscented soap so you can unwind after a day of walking the old quarter or the market.

We keep a shelf of maps and handwritten notes for places we actually go: the phở shop that opens early, the small coffee roaster, the riverside path with fewer tourists, and where to buy fruit in season. If you want help booking a ride or choosing a vegetarian meal, message us—we are nearby and reply as fast as we can.

We hope this little house feels like a pause worth taking: not flashy, but warm, clear, and real.`;

const homestaySectionData = {
  id: HOMESTAY_SECTION_ID,
  title: "Stay at TwentyNine Homestay",
  titleVi: "",
  previewDescription: homestayPreview,
  previewDescriptionVi: "",
  description: homestayFullDescription,
  descriptionVi: "",
  isActive: true,
  locationLabelVi: "",
  seasonalRatesNoteVi: ""
};

const closingSectionData = {
  id: CLOSING_SECTION_ID,
  title: "Thank You for Visiting",
  titleVi: "",
  message:
    "If you need a room, a ride, or a trusted local guide, send a message and I can help you plan a smooth stay.",
  messageVi: "",
  ctaLabel: "Send a Message",
  ctaLabelVi: "",
  ctaLink: "https://wa.me/855000000000"
};

const contacts = [
  {
    id: "contact-gmail",
    platform: "gmail",
    label: "Email",
    labelVi: "",
    value: "hello@twentyninehomestay.com",
    link: "mailto:hello@twentyninehomestay.com",
    icon: "mail",
    isActive: true,
    sortOrder: 1
  },
  {
    id: "contact-whatsapp",
    platform: "whatsapp",
    label: "WhatsApp",
    labelVi: "",
    value: "+855 00 000 000",
    link: "https://wa.me/855000000000",
    icon: "message-circle-more",
    isActive: true,
    sortOrder: 2
  },
  {
    id: "contact-zalo",
    platform: "zalo",
    label: "Zalo",
    labelVi: "",
    value: "TwentyNine Homestay",
    link: "https://zalo.me",
    icon: "message-square",
    isActive: true,
    sortOrder: 3
  },
  {
    id: "contact-kakaotalk",
    platform: "kakaotalk",
    label: "KakaoTalk",
    labelVi: "",
    value: "twentynine.host",
    link: "https://www.kakaocorp.com/page/service/service/KakaoTalk",
    icon: "messages-square",
    isActive: true,
    sortOrder: 4
  },
  {
    id: "contact-wechat",
    platform: "wechat",
    label: "WeChat",
    labelVi: "",
    value: "twentynine.host",
    link: "https://www.wechat.com",
    icon: "messages-square",
    isActive: false,
    sortOrder: 5
  },
  {
    id: "contact-line",
    platform: "line",
    label: "Line",
    labelVi: "",
    value: "@twentynine",
    link: "https://line.me",
    icon: "message-circle",
    isActive: true,
    sortOrder: 6
  },
  {
    id: "contact-instagram",
    platform: "instagram",
    label: "Instagram",
    labelVi: "",
    value: "@twentyninehomestay",
    link: "https://instagram.com/twentyninehomestay",
    icon: "instagram",
    isActive: true,
    sortOrder: 7
  }
] as const;

const services = [
  {
    id: "service-local-guide",
    title: "Local Guide",
    titleVi: "",
    description:
      "Private local guidance for easy planning, hidden spots, and practical travel support.",
    descriptionVi: "",
    icon: "map",
    ctaLabel: "Ask About Tours",
    ctaLabelVi: "",
    ctaLink: "https://wa.me/855000000000",
    isActive: true,
    sortOrder: 1
  },
  {
    id: "service-taxi",
    title: "Taxi",
    titleVi: "",
    description: "Trusted rides for city transfers, day trips, and flexible schedules.",
    descriptionVi: "",
    icon: "car-front",
    ctaLabel: "Book a Ride",
    ctaLabelVi: "",
    ctaLink: "https://wa.me/855000000000",
    isActive: true,
    sortOrder: 2
  },
  {
    id: "service-airport-pickup",
    title: "Airport Pickup",
    titleVi: "",
    description: "Straightforward airport pickup so guests arrive without confusion.",
    descriptionVi: "",
    icon: "plane-landing",
    ctaLabel: "Arrange Pickup",
    ctaLabelVi: "",
    ctaLink: "https://wa.me/855000000000",
    isActive: true,
    sortOrder: 3
  },
  {
    id: "service-tuk-tuk",
    title: "Tuk Tuk",
    titleVi: "",
    description: "Simple short-distance transport with a local host experience.",
    descriptionVi: "",
    icon: "bike",
    ctaLabel: "Check Availability",
    ctaLabelVi: "",
    ctaLink: "https://wa.me/855000000000",
    isActive: true,
    sortOrder: 4
  },
  {
    id: "service-custom-support",
    title: "Custom Travel Support",
    titleVi: "",
    description: "Flexible help for routes, recommendations, bookings, and local questions.",
    descriptionVi: "",
    icon: "sparkles",
    ctaLabel: "Plan My Trip",
    ctaLabelVi: "",
    ctaLink: "https://wa.me/855000000000",
    isActive: true,
    sortOrder: 5
  }
] as const;

const gallery = [
  {
    id: "gallery-1",
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200",
    altText: "Grand boutique exterior",
    sortOrder: 1
  },
  {
    id: "gallery-2",
    imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1200",
    altText: "Master suite morning light",
    sortOrder: 2
  },
  {
    id: "gallery-3",
    imageUrl: "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?q=80&w=1200",
    altText: "Tropical pool side",
    sortOrder: 3
  },
  {
    id: "gallery-4",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
    altText: "Sunlit dining area",
    sortOrder: 4
  },
  {
    id: "gallery-5",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200",
    altText: "Luxury architectural design",
    sortOrder: 5
  }
] as const;

/** Remote URLs only; storagePath labels the logical asset key for admin */
const mediaAssetSeeds = [
  {
    id: "media-avatar",
    fileName: "avatar-host.jpg",
    originalName: "avatar-host.jpg",
    mimeType: "image/jpeg",
    fileSize: 143701,
    storagePath: "mock/avatar-host.jpg",
    publicUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=900&auto=format&fit=crop",
    altText: "Smiling homestay host portrait"
  },
  {
    id: "media-room",
    fileName: "homestay-room.jpg",
    originalName: "homestay-room.jpg",
    mimeType: "image/jpeg",
    fileSize: 302267,
    storagePath: "mock/homestay-room.jpg",
    publicUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop",
    altText: "Homestay room photo"
  },
  {
    id: "media-amenities",
    fileName: "homestay-amenities.jpg",
    originalName: "homestay-amenities.jpg",
    mimeType: "image/jpeg",
    fileSize: 210680,
    storagePath: "mock/homestay-amenities.jpg",
    publicUrl: "https://images.unsplash.com/photo-1583416750470-965b2507ef47?q=80&w=800&auto=format&fit=crop",
    altText: "Premium bathroom amenities"
  },
  {
    id: "media-kitchen",
    fileName: "homestay-kitchen.jpg",
    originalName: "homestay-kitchen.jpg",
    mimeType: "image/jpeg",
    fileSize: 225706,
    storagePath: "mock/homestay-kitchen.jpg",
    publicUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    altText: "Warm sunlit kitchen photo"
  }
] as const;

async function main() {
  const passwordHash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!",
    10
  );

  const admin = await prisma.adminUser.upsert({
    where: {
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@twentyninehomestay.local"
    },
    update: {
      passwordHash,
      role: "SUPER_ADMIN"
    },
    create: {
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@twentyninehomestay.local",
      passwordHash,
      role: "SUPER_ADMIN"
    }
  });

  await prisma.homestaySection.upsert({
    where: { id: HOMESTAY_SECTION_ID },
    update: omitKeys(homestaySectionData, [
      "id",
      "titleVi",
      "previewDescriptionVi",
      "descriptionVi",
      "locationLabelVi",
      "seasonalRatesNoteVi"
    ]),
    create: homestaySectionData
  });

  await prisma.closingSection.upsert({
    where: { id: CLOSING_SECTION_ID },
    update: omitKeys(closingSectionData, ["id", "titleVi", "messageVi", "ctaLabelVi"]),
    create: closingSectionData
  });

  await prisma.contactMethod.deleteMany({
    where: {
      id: {
        notIn: contacts.map((item) => item.id)
      }
    }
  });

  for (const contact of contacts) {
    await prisma.contactMethod.upsert({
      where: { id: contact.id },
      update: omitKeys(contact, ["id", "labelVi"]),
      create: contact
    });
  }

  await prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: omitKeys(profileData, [
      "id",
      "fullNameVi",
      "titleVi",
      "shortIntroVi",
      "heroPrimaryCtaLabelVi",
      "heroSecondaryCtaLabelVi"
    ]),
    create: profileData
  });

  await prisma.serviceItem.deleteMany({
    where: {
      id: {
        notIn: services.map((item) => item.id)
      }
    }
  });

  for (const service of services) {
    await prisma.serviceItem.upsert({
      where: { id: service.id },
      update: omitKeys(service, ["id", "titleVi", "descriptionVi", "ctaLabelVi"]),
      create: service
    });
  }

  await prisma.homestayImage.deleteMany({
    where: {
      id: {
        notIn: gallery.map((item) => item.id)
      }
    }
  });

  for (const image of gallery) {
    await prisma.homestayImage.upsert({
      where: { id: image.id },
      update: {
        imageUrl: image.imageUrl,
        altText: image.altText,
        sortOrder: image.sortOrder,
        homestaySectionId: HOMESTAY_SECTION_ID
      },
      create: {
        id: image.id,
        imageUrl: image.imageUrl,
        mediaKind: "IMAGE",
        altText: image.altText,
        altTextVi: "",
        sortOrder: image.sortOrder,
        homestaySectionId: HOMESTAY_SECTION_ID
      }
    });
  }

  await prisma.mediaAsset.deleteMany({
    where: {
      id: {
        notIn: mediaAssetSeeds.map((item) => item.id)
      }
    }
  });

  for (const asset of mediaAssetSeeds) {
    await prisma.mediaAsset.upsert({
      where: { id: asset.id },
      update: {
        ...asset,
        uploadedById: admin.id
      },
      create: {
        ...asset,
        uploadedById: admin.id
      }
    });
  }
}

main()
  .then(async () => {
    console.log("Seed completed.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
