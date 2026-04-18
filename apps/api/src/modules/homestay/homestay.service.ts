import { HOMESTAY_SECTION_ID } from "../../constants/site.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";

const defaultHomestay = {
  id: HOMESTAY_SECTION_ID,
  title: "Stay at TwentyNine Homestay",
  previewDescription:
    "A friendly place to stay with soft colors, local warmth, and easy transport support for guests arriving for a short visit or a longer trip.",
  description: `A colorful, welcoming home base for travelers who want comfort, local connection, and easy access to transport support.

The house sits a few steps from the main street but far enough that evenings feel quieter. Mornings start with light through the east-facing window—soft, not harsh—so you can ease into the day without an alarm.

Downstairs is a shared kitchen and a long dining table where we leave hot tea, crisp bread, and a few slim books, like inviting a friend home rather than checking into a hotel.

Bedrooms stay minimal: a wide bed, cotton sheets, soft pillows, and a reading lamp. The bathroom is compact and spotless, with steady hot water and gentle, unscented soap so you can unwind after a day of walking the old quarter or the market.

We keep a shelf of maps and handwritten notes for places we actually go: the phở shop that opens early, the small coffee roaster, the riverside path with fewer tourists, and where to buy fruit in season. If you want help booking a ride or choosing a vegetarian meal, message us—we are nearby and reply as fast as we can.

We hope this little house feels like a pause worth taking: not flashy, but warm, clear, and real.`,
  isActive: true
};

type HomestaySectionInput = {
  title: string;
  previewDescription: string;
  description: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  seasonalRatesNote: string | null;
};

type HomestayImageInput = {
  imageUrl: string;
  altText: string;
  sortOrder: number;
};

export async function getHomestayContent() {
  const section = await prisma.homestaySection.upsert({
    where: { id: HOMESTAY_SECTION_ID },
    update: {},
    create: defaultHomestay,
    include: {
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  return section;
}

export async function listHomestayImages() {
  return prisma.homestayImage.findMany({
    where: {
      homestaySectionId: HOMESTAY_SECTION_ID
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });
}

export async function getPublicHomestayContent() {
  const section = await getHomestayContent();

  if (!section.isActive) {
    return null;
  }

  return section;
}

export async function updateHomestaySection(input: HomestaySectionInput) {
  return prisma.homestaySection.upsert({
    where: { id: HOMESTAY_SECTION_ID },
    update: input,
    create: {
      ...defaultHomestay,
      ...input
    },
    include: {
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });
}

export async function createHomestayImage(input: HomestayImageInput) {
  return prisma.homestayImage.create({
    data: {
      ...input,
      homestaySectionId: HOMESTAY_SECTION_ID
    }
  });
}

export async function updateHomestayImage(
  id: string,
  input: Partial<HomestayImageInput>
) {
  const existing = await prisma.homestayImage.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new AppError(404, "IMAGE_NOT_FOUND", "Homestay image not found.");
  }

  return prisma.homestayImage.update({
    where: { id },
    data: input
  });
}

export async function deleteHomestayImage(id: string) {
  const existing = await prisma.homestayImage.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new AppError(404, "IMAGE_NOT_FOUND", "Homestay image not found.");
  }

  await prisma.homestayImage.delete({
    where: { id }
  });
}
