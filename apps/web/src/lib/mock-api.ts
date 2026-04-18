import type {
  AdminUser,
  ClosingSection,
  ContactMethod,
  HomestayImage,
  HomestaySection,
  MediaAsset,
  Profile,
  ServiceItem,
  SiteContent
} from "../types/content";
import { contactCtaLabel } from "./contact-cta-label";
import { ApiError } from "./api-error";

type MockState = {
  profile: Profile;
  contacts: ContactMethod[];
  homestay: HomestaySection;
  services: ServiceItem[];
  closing: ClosingSection;
  media: MediaAsset[];
};

const MOCK_STATE_KEY = "twentynine.mock.state";
const MOCK_USER_KEY = "twentynine.mock.user";

const now = () => new Date().toISOString();

function createDefaultMockState(): MockState {
  const createdAt = now();

  return {
    profile: {
      id: "profile_singleton",
      fullName: "Nguyen Thanh Hoang",
      title: "Nguyen Thanh Hoang",
      shortIntro:
        "I help travelers feel comfortable from the moment they arrive, with a warm homestay, local rides, and personal support for planning around the city.",
      avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
      heroPrimaryCtaLabel: "Chat on WhatsApp",
      heroPrimaryCtaLink: "https://wa.me/855000000000",
      heroSecondaryCtaLabel: "See the Homestay",
      heroSecondaryCtaLink: "#homestay",
      heroPrimaryContactId: "contact-whatsapp",
      heroSecondaryContactId: null,
      updatedAt: createdAt
    },
    contacts: [
      {
        id: "contact-gmail",
        platform: "gmail",
        label: "Email",
        value: "hello@twentyninehomestay.com",
        link: "mailto:hello@twentyninehomestay.com",
        icon: "mail",
        isActive: true,
        sortOrder: 1,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "contact-whatsapp",
        platform: "whatsapp",
        label: "WhatsApp",
        value: "+855 00 000 000",
        link: "https://wa.me/855000000000",
        icon: "message-circle-more",
        isActive: true,
        sortOrder: 2,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "contact-zalo",
        platform: "zalo",
        label: "Zalo",
        value: "TwentyNine Homestay",
        link: "https://zalo.me",
        icon: "message-square",
        isActive: true,
        sortOrder: 3,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "contact-kakaotalk",
        platform: "kakaotalk",
        label: "KakaoTalk",
        value: "twentynine.host",
        link: "https://www.kakaocorp.com/page/service/service/KakaoTalk",
        icon: "messages-square",
        isActive: true,
        sortOrder: 4,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "contact-wechat",
        platform: "wechat",
        label: "WeChat",
        value: "twentynine.host",
        link: "https://www.wechat.com",
        icon: "messages-square",
        isActive: false,
        sortOrder: 5,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "contact-line",
        platform: "line",
        label: "Line",
        value: "@twentynine",
        link: "https://line.me",
        icon: "message-circle",
        isActive: true,
        sortOrder: 6,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "contact-instagram",
        platform: "instagram",
        label: "Instagram",
        value: "@twentyninehomestay",
        link: "https://instagram.com/twentyninehomestay",
        icon: "instagram",
        isActive: true,
        sortOrder: 7,
        createdAt,
        updatedAt: createdAt
      }
    ],
    homestay: {
      id: "homestay_singleton",
      title: "Stay at TwentyNine Homestay",
      previewDescription:
        "A friendly place to stay with soft colors, local warmth, and easy transport support for guests arriving for a short visit or a longer trip.",
      description: `A colorful, welcoming home base for travelers who want comfort, local connection, and easy access to transport support.

The house sits a few steps from the main street but far enough that evenings feel quieter. Mornings start with light through the east-facing window—soft, not harsh—so you can ease into the day without an alarm.

Downstairs is a shared kitchen and a long dining table where we leave hot tea, crisp bread, and a few slim books, like inviting a friend home rather than checking into a hotel.

Bedrooms stay minimal: a wide bed, cotton sheets, soft pillows, and a reading lamp. The bathroom is compact and spotless, with steady hot water and gentle, unscented soap so you can unwind after a day of walking the old quarter or the market.

We keep a shelf of maps and handwritten notes for places we actually go: the phở shop that opens early, the small coffee roaster, the riverside path with fewer tourists, and where to buy fruit in season. If you want help booking a ride or choosing a vegetarian meal, message us—we are nearby and reply as fast as we can.

We hope this little house feels like a pause worth taking: not flashy, but warm, clear, and real.`,
      isActive: true,
      latitude: null,
      longitude: null,
      locationLabel: null,
      seasonalRatesNote: null,
      images: [
        {
          id: "gallery-1",
          homestaySectionId: "homestay_singleton",
          imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200",
          altText: "Grand boutique exterior",
          sortOrder: 1,
          createdAt,
          updatedAt: createdAt
        },
        {
          id: "gallery-2",
          homestaySectionId: "homestay_singleton",
          imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1200",
          altText: "Master suite morning light",
          sortOrder: 2,
          createdAt,
          updatedAt: createdAt
        },
        {
          id: "gallery-3",
          homestaySectionId: "homestay_singleton",
          imageUrl: "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?q=80&w=1200",
          altText: "Tropical pool side",
          sortOrder: 3,
          createdAt,
          updatedAt: createdAt
        },
        {
          id: "gallery-4",
          homestaySectionId: "homestay_singleton",
          imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
          altText: "Sunlit dining area",
          sortOrder: 4,
          createdAt,
          updatedAt: createdAt
        },
        {
          id: "gallery-5",
          homestaySectionId: "homestay_singleton",
          imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200",
          altText: "Luxury architectural design",
          sortOrder: 5,
          createdAt,
          updatedAt: createdAt
        }
      ]
    },
    services: [
      {
        id: "service-local-guide",
        title: "Local Guide",
        description:
          "Private local guidance for easy planning, hidden spots, and practical travel support.",
        icon: "map",
        ctaLabel: "Ask About Tours",
        ctaLink: "https://wa.me/855000000000",
        isActive: true,
        sortOrder: 1
      },
      {
        id: "service-taxi",
        title: "Taxi",
        description: "Trusted rides for city transfers, day trips, and flexible schedules.",
        icon: "car-front",
        ctaLabel: "Book a Ride",
        ctaLink: "https://wa.me/855000000000",
        isActive: true,
        sortOrder: 2
      },
      {
        id: "service-airport-pickup",
        title: "Airport Pickup",
        description: "Straightforward airport pickup so guests arrive without confusion.",
        icon: "plane-landing",
        ctaLabel: "Arrange Pickup",
        ctaLink: "https://wa.me/855000000000",
        isActive: true,
        sortOrder: 3
      },
      {
        id: "service-tuk-tuk",
        title: "Tuk Tuk",
        description: "Simple short-distance transport with a local host experience.",
        icon: "bike",
        ctaLabel: "Check Availability",
        ctaLink: "https://wa.me/855000000000",
        isActive: true,
        sortOrder: 4
      },
      {
        id: "service-custom-support",
        title: "Custom Travel Support",
        description: "Flexible help for routes, recommendations, bookings, and local questions.",
        icon: "sparkles",
        ctaLabel: "Plan My Trip",
        ctaLink: "https://wa.me/855000000000",
        isActive: true,
        sortOrder: 5
      }
    ],
    closing: {
      id: "closing_singleton",
      title: "Thank You for Visiting",
      message:
        "If you need a room, a ride, or a trusted local guide, send a message and I can help you plan a smooth stay.",
      ctaLabel: "Send a Message",
      ctaLink: "https://wa.me/855000000000"
    },
    media: [
      {
        id: "media-avatar",
        fileName: "avatar-host.jpg",
        originalName: "avatar-host.jpg",
        mimeType: "image/jpeg",
        fileSize: 143701,
        storagePath: "mock/avatar-host.jpg",
        publicUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=900&auto=format&fit=crop",
        altText: "Smiling homestay host portrait",
        uploadedById: "mock-admin",
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "media-room",
        fileName: "homestay-room.jpg",
        originalName: "homestay-room.jpg",
        mimeType: "image/jpeg",
        fileSize: 302267,
        storagePath: "mock/homestay-room.jpg",
        publicUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop",
        altText: "Homestay room photo",
        uploadedById: "mock-admin",
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "media-amenities",
        fileName: "homestay-amenities.jpg",
        originalName: "homestay-amenities.jpg",
        mimeType: "image/jpeg",
        fileSize: 210680,
        storagePath: "mock/homestay-amenities.jpg",
        publicUrl: "https://images.unsplash.com/photo-1583416750470-965b2507ef47?q=80&w=800&auto=format&fit=crop",
        altText: "Premium bathroom amenities",
        uploadedById: "mock-admin",
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "media-kitchen",
        fileName: "homestay-kitchen.jpg",
        originalName: "homestay-kitchen.jpg",
        mimeType: "image/jpeg",
        fileSize: 225706,
        storagePath: "mock/homestay-kitchen.jpg",
        publicUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        altText: "Warm sunlit kitchen photo",
        uploadedById: "mock-admin",
        createdAt,
        updatedAt: createdAt
      }
    ]
  };
}

function loadMockState(): MockState {
  if (typeof window === "undefined") {
    return createDefaultMockState();
  }

  // Force reload of mock data with verified Unsplash IDs
  const isUpgraded = window.localStorage.getItem("twentynine.mock.upgraded_v6");
  if (!isUpgraded) {
    const initialState = createDefaultMockState();
    window.localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(initialState));
    window.localStorage.setItem("twentynine.mock.upgraded_v6", "true");
    return initialState;
  }

  const isHomestayPreview = window.localStorage.getItem("twentynine.mock.upgraded_v7_homestay_preview");
  if (!isHomestayPreview) {
    const initialState = createDefaultMockState();
    window.localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(initialState));
    window.localStorage.setItem("twentynine.mock.upgraded_v7_homestay_preview", "true");
    return initialState;
  }

  const isHeroContactFk = window.localStorage.getItem("twentynine.mock.upgraded_v8_hero_contact_fk");
  if (!isHeroContactFk) {
    const initialState = createDefaultMockState();
    window.localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(initialState));
    window.localStorage.setItem("twentynine.mock.upgraded_v8_hero_contact_fk", "true");
    return initialState;
  }

  const raw = window.localStorage.getItem(MOCK_STATE_KEY);

  if (!raw) {
    const initialState = createDefaultMockState();
    window.localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  return JSON.parse(raw) as MockState;
}

function saveMockState(state: MockState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(state));
  }
}

function getMockUser(): AdminUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(MOCK_USER_KEY);
  return raw ? (JSON.parse(raw) as AdminUser) : null;
}

function saveMockUser(user: AdminUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(MOCK_USER_KEY);
    return;
  }

  window.localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

function requireMockAuth() {
  const user = getMockUser();

  if (!user) {
    throw new ApiError("Authentication is required.", "UNAUTHENTICATED");
  }

  return user;
}

/** Match public API: strip FKs and resolve hero CTAs from linked active contacts. */
function materializePublicProfile(profile: Profile, contacts: ContactMethod[]): Profile {
  const byId = new Map(contacts.map((c) => [c.id, c]));
  let heroPrimaryCtaLabel = profile.heroPrimaryCtaLabel;
  let heroPrimaryCtaLink = profile.heroPrimaryCtaLink;
  if (profile.heroPrimaryContactId) {
    const c = byId.get(profile.heroPrimaryContactId);
    if (c?.isActive) {
      heroPrimaryCtaLabel = contactCtaLabel(c);
      heroPrimaryCtaLink = c.link;
    }
  }
  let heroSecondaryCtaLabel = profile.heroSecondaryCtaLabel;
  let heroSecondaryCtaLink = profile.heroSecondaryCtaLink;
  if (profile.heroSecondaryContactId) {
    const c = byId.get(profile.heroSecondaryContactId);
    if (c?.isActive) {
      heroSecondaryCtaLabel = contactCtaLabel(c);
      heroSecondaryCtaLink = c.link;
    }
  }
  const {
    heroPrimaryContactId: _primaryFk,
    heroSecondaryContactId: _secondaryFk,
    ...rest
  } = profile;
  return {
    ...rest,
    heroPrimaryCtaLabel,
    heroPrimaryCtaLink,
    heroSecondaryCtaLabel,
    heroSecondaryCtaLink
  };
}

function buildPublicSiteContent(state: MockState): SiteContent {
  return {
    profile: materializePublicProfile(state.profile, state.contacts),
    contacts: state.contacts
      .filter((item) => item.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder),
    homestay: state.homestay.isActive
      ? {
          ...state.homestay,
          images: [...state.homestay.images].sort(
            (left, right) => left.sortOrder - right.sortOrder
          )
        }
      : null,
    services: state.services
      .filter((item) => item.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder),
    closing: state.closing
  };
}

function parseJsonBody<TData>(body: BodyInit | null | undefined): TData {
  if (typeof body !== "string") {
    throw new ApiError("Mock API expected a JSON string body.", "INVALID_MOCK_BODY");
  }

  return JSON.parse(body) as TData;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new ApiError("Unable to read the uploaded file."));
    reader.readAsDataURL(file);
  });
}

function withUpdatedTimestamp<TItem extends { updatedAt?: string }>(item: TItem): TItem {
  return {
    ...item,
    updatedAt: now()
  };
}

export async function handleMockApiRequest<TData>(
  path: string,
  init: RequestInit = {}
): Promise<TData> {
  const method = (init.method ?? "GET").toUpperCase();
  const state = loadMockState();

  if (path === "/auth/login" && method === "POST") {
    const body = parseJsonBody<{ email: string; password: string }>(init.body);

    if (!body.email.trim() || !body.password.trim()) {
      throw new ApiError("Email and password are required.", "INVALID_CREDENTIALS");
    }

    const user: AdminUser = {
      id: "mock-admin",
      email: body.email.trim(),
      role: "SUPER_ADMIN"
    };

    saveMockUser(user);
    return { user } as TData;
  }

  if (path === "/auth/logout" && method === "POST") {
    saveMockUser(null);
    return { loggedOut: true } as TData;
  }

  if (path === "/auth/me" && method === "GET") {
    return { user: requireMockAuth() } as TData;
  }

  if (path === "/public/site-content" && method === "GET") {
    return buildPublicSiteContent(state) as TData;
  }

  if (path === "/public/profile" && method === "GET") {
    return materializePublicProfile(state.profile, state.contacts) as TData;
  }

  if (path === "/public/contacts" && method === "GET") {
    return buildPublicSiteContent(state).contacts as TData;
  }

  if (path === "/public/homestay" && method === "GET") {
    return buildPublicSiteContent(state).homestay as TData;
  }

  if (path === "/public/services" && method === "GET") {
    return buildPublicSiteContent(state).services as TData;
  }

  if (path === "/public/closing" && method === "GET") {
    return state.closing as TData;
  }

  requireMockAuth();

  if (path === "/admin/profile" && method === "GET") {
    return state.profile as TData;
  }

  if (path === "/admin/profile" && method === "PUT") {
    const body = parseJsonBody<Omit<Profile, "id">>(init.body);
    state.profile = withUpdatedTimestamp({
      ...state.profile,
      ...body
    });
    saveMockState(state);
    return state.profile as TData;
  }

  if (path === "/admin/contacts" && method === "GET") {
    return [...state.contacts].sort((left, right) => left.sortOrder - right.sortOrder) as TData;
  }

  if (path === "/admin/contacts" && method === "POST") {
    const body = parseJsonBody<Omit<ContactMethod, "id">>(init.body);
    const next: ContactMethod = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: now(),
      updatedAt: now()
    };
    state.contacts = [...state.contacts, next];
    saveMockState(state);
    return next as TData;
  }

  if (path.startsWith("/admin/contacts/")) {
    const contactId = path.replace("/admin/contacts/", "");
    const index = state.contacts.findIndex((item) => item.id === contactId);

    if (index === -1) {
      throw new ApiError("Contact method not found.", "CONTACT_NOT_FOUND");
    }

    if (method === "PATCH") {
      const body = parseJsonBody<Partial<ContactMethod>>(init.body);
      state.contacts[index] = withUpdatedTimestamp({
        ...state.contacts[index],
        ...body
      });
      saveMockState(state);
      return state.contacts[index] as TData;
    }

    if (method === "DELETE") {
      state.contacts.splice(index, 1);
      saveMockState(state);
      return { deleted: true } as TData;
    }
  }

  if (path === "/admin/homestay" && method === "GET") {
    return {
      ...state.homestay,
      images: [...state.homestay.images].sort((left, right) => left.sortOrder - right.sortOrder)
    } as TData;
  }

  if (path === "/admin/homestay" && method === "PUT") {
    const body = parseJsonBody<
      Pick<HomestaySection, "title" | "previewDescription" | "description" | "isActive">
    >(init.body);
    state.homestay = {
      ...state.homestay,
      ...body
    };
    saveMockState(state);
    return state.homestay as TData;
  }

  if (path === "/admin/homestay-images" && method === "POST") {
    const body = parseJsonBody<Omit<HomestayImage, "id" | "homestaySectionId">>(init.body);
    const next: HomestayImage = {
      ...body,
      id: crypto.randomUUID(),
      homestaySectionId: state.homestay.id,
      createdAt: now(),
      updatedAt: now()
    };
    state.homestay.images = [...state.homestay.images, next];
    saveMockState(state);
    return next as TData;
  }

  if (path.startsWith("/admin/homestay-images/")) {
    const imageId = path.replace("/admin/homestay-images/", "");
    const index = state.homestay.images.findIndex((item) => item.id === imageId);

    if (index === -1) {
      throw new ApiError("Homestay image not found.", "IMAGE_NOT_FOUND");
    }

    if (method === "PATCH") {
      const body = parseJsonBody<Partial<HomestayImage>>(init.body);
      state.homestay.images[index] = withUpdatedTimestamp({
        ...state.homestay.images[index],
        ...body
      });
      saveMockState(state);
      return state.homestay.images[index] as TData;
    }

    if (method === "DELETE") {
      state.homestay.images.splice(index, 1);
      saveMockState(state);
      return { deleted: true } as TData;
    }
  }

  if (path === "/admin/services" && method === "GET") {
    return [...state.services].sort((left, right) => left.sortOrder - right.sortOrder) as TData;
  }

  if (path === "/admin/services" && method === "POST") {
    const body = parseJsonBody<Omit<ServiceItem, "id">>(init.body);
    const next: ServiceItem = {
      ...body,
      id: crypto.randomUUID()
    };
    state.services = [...state.services, next];
    saveMockState(state);
    return next as TData;
  }

  if (path.startsWith("/admin/services/")) {
    const serviceId = path.replace("/admin/services/", "");
    const index = state.services.findIndex((item) => item.id === serviceId);

    if (index === -1) {
      throw new ApiError("Service item not found.", "SERVICE_NOT_FOUND");
    }

    if (method === "PATCH") {
      const body = parseJsonBody<Partial<ServiceItem>>(init.body);
      state.services[index] = {
        ...state.services[index],
        ...body
      };
      saveMockState(state);
      return state.services[index] as TData;
    }

    if (method === "DELETE") {
      state.services.splice(index, 1);
      saveMockState(state);
      return { deleted: true } as TData;
    }
  }

  if (path === "/admin/closing" && method === "GET") {
    return state.closing as TData;
  }

  if (path === "/admin/closing" && method === "PUT") {
    const body = parseJsonBody<Omit<ClosingSection, "id">>(init.body);
    state.closing = {
      ...state.closing,
      ...body
    };
    saveMockState(state);
    return state.closing as TData;
  }

  if (path === "/admin/media" && method === "GET") {
    return [...state.media] as TData;
  }

  if (path === "/admin/media" && method === "POST") {
    if (!(init.body instanceof FormData)) {
      throw new ApiError("A file upload is required.", "FILE_REQUIRED");
    }

    const file = init.body.get("file");

    if (!(file instanceof File)) {
      throw new ApiError("A file upload is required.", "FILE_REQUIRED");
    }

    const publicUrl = await fileToDataUrl(file);
    const next: MediaAsset = {
      id: crypto.randomUUID(),
      fileName: file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      storagePath: `mock-upload/${file.name}`,
      publicUrl,
      altText: file.name.replace(/\.[^.]+$/, ""),
      uploadedById: "mock-admin",
      createdAt: now(),
      updatedAt: now()
    };

    state.media = [next, ...state.media];
    saveMockState(state);
    return next as TData;
  }

  if (path.startsWith("/admin/media/")) {
    const mediaId = path.replace("/admin/media/", "");
    const index = state.media.findIndex((item) => item.id === mediaId);

    if (index === -1) {
      throw new ApiError("Media item not found.", "MEDIA_NOT_FOUND");
    }

    if (method === "PATCH") {
      const body = parseJsonBody<Partial<MediaAsset>>(init.body);
      state.media[index] = withUpdatedTimestamp({
        ...state.media[index],
        ...body
      });
      saveMockState(state);
      return state.media[index] as TData;
    }

    if (method === "DELETE") {
      const selectedUrl = state.media[index].publicUrl;
      const isUsedByProfile = state.profile.avatarImage === selectedUrl;
      const isUsedByHomestay = state.homestay.images.some(
        (item) => item.imageUrl === selectedUrl
      );

      if (isUsedByProfile || isUsedByHomestay) {
        throw new ApiError(
          "This media item is currently assigned to public content.",
          "MEDIA_IN_USE"
        );
      }

      state.media.splice(index, 1);
      saveMockState(state);
      return { deleted: true } as TData;
    }
  }

  throw new ApiError(`Mock API route is not implemented for ${method} ${path}`, "MOCK_ROUTE_MISSING");
}

export function resetMockState() {
  const state = createDefaultMockState();
  saveMockState(state);
  saveMockUser(null);
}
