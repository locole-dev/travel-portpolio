import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type ApiEnvelope<TData> = {
  success: boolean;
  data?: TData;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type AdminUserResponse = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

type ProfileResponse = {
  id: string;
  fullName: string;
  title: string;
  shortIntro: string;
  avatarImage: string | null;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaLink: string;
  heroPrimaryContactId: string | null;
  heroSecondaryContactId: string | null;
};

type ContactResponse = {
  id: string;
  platform: string;
  label: string;
  value?: string | null;
  link: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
};

type HomestaySectionResponse = {
  id: string;
  title: string;
  previewDescription: string;
  description: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  seasonalRatesNote: string | null;
  images: HomestayImageResponse[];
};

type HomestayImageResponse = {
  id: string;
  homestaySectionId: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
};

type ServiceResponse = {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  isActive: boolean;
  sortOrder: number;
};

type ClosingResponse = {
  id: string;
  title: string;
  message: string;
  ctaLabel: string;
  ctaLink: string;
};

type MediaResponse = {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  publicUrl: string;
  altText?: string | null;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const baseUrl =
  process.env.SMOKE_API_BASE_URL?.replace(/\/$/, "") ??
  `http://localhost:${process.env.API_PORT ?? "4000"}/api/v1`;
const healthUrl = new URL("/health", `${baseUrl}/`).toString();
const adminEmail =
  process.env.SMOKE_ADMIN_EMAIL ??
  process.env.SEED_ADMIN_EMAIL ??
  "admin@twentyninehomestay.local";
const adminPassword =
  process.env.SMOKE_ADMIN_PASSWORD ??
  process.env.SEED_ADMIN_PASSWORD ??
  "ChangeMe123!";

let authCookie = "";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getCookieFromResponse(response: Response) {
  const setCookie =
    response.headers.get("set-cookie") ??
    response.headers.getSetCookie?.()?.[0] ??
    "";

  return setCookie.split(";")[0] ?? "";
}

async function request<TData>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (authCookie) {
    headers.set("cookie", authCookie);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers
  });

  const payload = (await response.json()) as ApiEnvelope<TData>;

  if (path === "/auth/login") {
    authCookie = getCookieFromResponse(response);
  }

  if (!response.ok || !payload.success) {
    throw new Error(
      `${init.method ?? "GET"} ${path} failed: ${
        payload.error?.message ?? response.statusText
      }`
    );
  }

  return payload.data as TData;
}

async function expectFailure(path: string, expectedStatus: number) {
  const headers = new Headers();

  if (authCookie) {
    headers.set("cookie", authCookie);
  }

  const response = await fetch(`${baseUrl}${path}`, { headers });
  assert(
    response.status === expectedStatus,
    `${path} expected ${expectedStatus} but returned ${response.status}`
  );
}

async function testPublicRoutes() {
  const siteContent = await request<{
    profile: ProfileResponse;
    contacts: ContactResponse[];
    homestay: HomestaySectionResponse | null;
    services: ServiceResponse[];
    closing: ClosingResponse;
  }>("/public/site-content");

  assert(siteContent.profile.fullName.length > 1, "Profile seed data is missing.");
  assert(siteContent.contacts.length > 0, "No public contact methods found.");
  assert(siteContent.services.length > 0, "No public services found.");

  const [profile, contacts, homestay, services, closing] = await Promise.all([
    request<ProfileResponse>("/public/profile"),
    request<ContactResponse[]>("/public/contacts"),
    request<HomestaySectionResponse | null>("/public/homestay"),
    request<ServiceResponse[]>("/public/services"),
    request<ClosingResponse>("/public/closing")
  ]);

  assert(profile.id === siteContent.profile.id, "Public profile route returned a mismatch.");
  assert(contacts.length === siteContent.contacts.length, "Public contacts route mismatch.");
  assert(services.length === siteContent.services.length, "Public services route mismatch.");
  assert(closing.id === siteContent.closing.id, "Public closing route returned a mismatch.");
  assert(
    homestay?.id === siteContent.homestay?.id,
    "Public homestay route returned a mismatch."
  );
}

async function testAuthRoutes() {
  const loginData = await request<AdminUserResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword
    })
  });

  assert(authCookie.length > 0, "Login did not return an auth cookie.");
  assert(loginData.user.email === adminEmail, "Authenticated admin email did not match.");

  const me = await request<AdminUserResponse>("/auth/me");
  assert(me.user.role.length > 0, "Admin role was not returned.");
}

async function testProfileRoute() {
  const profile = await request<ProfileResponse>("/admin/profile");

  await request<ProfileResponse>("/admin/profile", {
    method: "PUT",
    body: JSON.stringify({
      fullName: profile.fullName,
      title: profile.title,
      shortIntro: profile.shortIntro,
      avatarImage: profile.avatarImage,
      heroPrimaryCtaLabel: profile.heroPrimaryCtaLabel,
      heroPrimaryCtaLink: profile.heroPrimaryCtaLink,
      heroSecondaryCtaLabel: profile.heroSecondaryCtaLabel,
      heroSecondaryCtaLink: profile.heroSecondaryCtaLink,
      heroPrimaryContactId: profile.heroPrimaryContactId,
      heroSecondaryContactId: profile.heroSecondaryContactId
    })
  });
}

async function testContactsRoutes() {
  const contacts = await request<ContactResponse[]>("/admin/contacts");
  assert(contacts.length > 0, "Admin contacts list is empty.");

  const createdContact = await request<ContactResponse>("/admin/contacts", {
    method: "POST",
    body: JSON.stringify({
      platform: "instagram",
      label: "Smoke Test Contact",
      value: "@smoke-test",
      link: "https://instagram.com/smoke-test",
      icon: "instagram",
      isActive: true,
      sortOrder: 999
    })
  });

  try {
    const fetchedContact = await request<ContactResponse>(
      `/admin/contacts/${createdContact.id}`
    );

    assert(
      fetchedContact.id === createdContact.id,
      "Admin contact detail route returned a mismatch."
    );

    await request<ContactResponse>(`/admin/contacts/${createdContact.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        label: "Smoke Test Contact Updated",
        isActive: false
      })
    });
  } finally {
    await request(`/admin/contacts/${createdContact.id}`, {
      method: "DELETE"
    });
  }
}

async function testHomestayRoutes() {
  const homestay = await request<HomestaySectionResponse>("/admin/homestay");
  const images = await request<HomestayImageResponse[]>("/admin/homestay-images");

  await request<HomestaySectionResponse>("/admin/homestay", {
    method: "PUT",
    body: JSON.stringify({
      title: homestay.title,
      previewDescription: homestay.previewDescription,
      description: homestay.description,
      isActive: homestay.isActive,
      latitude: homestay.latitude ?? null,
      longitude: homestay.longitude ?? null,
      locationLabel: homestay.locationLabel ?? null,
      seasonalRatesNote: homestay.seasonalRatesNote ?? null
    })
  });

  const imageUrl = images[0]?.imageUrl ?? homestay.images[0]?.imageUrl;
  assert(Boolean(imageUrl), "No homestay image URL available for smoke testing.");

  const createdImage = await request<HomestayImageResponse>("/admin/homestay-images", {
    method: "POST",
    body: JSON.stringify({
      imageUrl,
      altText: "Smoke test homestay image",
      sortOrder: 999
    })
  });

  try {
    await request<HomestayImageResponse>(`/admin/homestay-images/${createdImage.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        altText: "Smoke test homestay image updated"
      })
    });
  } finally {
    await request(`/admin/homestay-images/${createdImage.id}`, {
      method: "DELETE"
    });
  }
}

async function testServicesRoutes() {
  const services = await request<ServiceResponse[]>("/admin/services");
  assert(services.length > 0, "Admin services list is empty.");

  const createdService = await request<ServiceResponse>("/admin/services", {
    method: "POST",
    body: JSON.stringify({
      title: "Smoke Test Service",
      description: "Temporary service used to validate admin CRUD integration.",
      icon: "sparkles",
      ctaLabel: "Contact",
      ctaLink: "https://example.com/smoke-test",
      isActive: true,
      sortOrder: 999
    })
  });

  try {
    const fetchedService = await request<ServiceResponse>(
      `/admin/services/${createdService.id}`
    );

    assert(
      fetchedService.id === createdService.id,
      "Admin service detail route returned a mismatch."
    );

    await request<ServiceResponse>(`/admin/services/${createdService.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Smoke Test Service Updated",
        isActive: false
      })
    });
  } finally {
    await request(`/admin/services/${createdService.id}`, {
      method: "DELETE"
    });
  }
}

async function testClosingRoute() {
  const closing = await request<ClosingResponse>("/admin/closing");

  await request<ClosingResponse>("/admin/closing", {
    method: "PUT",
    body: JSON.stringify({
      title: closing.title,
      message: closing.message,
      ctaLabel: closing.ctaLabel,
      ctaLink: closing.ctaLink
    })
  });
}

async function testMediaRoutes() {
  const media = await request<MediaResponse[]>("/admin/media");
  assert(media.length > 0, "Admin media list is empty.");

  const uploadPath = path.resolve(scriptDir, "../uploads/avatar-host.jpg");
  const uploadContent = await readFile(uploadPath);
  const formData = new FormData();

  formData.append(
    "file",
    new Blob([uploadContent], { type: "image/jpeg" }),
    "smoke-upload.jpg"
  );

  const uploadedAsset = await request<MediaResponse>("/admin/media", {
    method: "POST",
    body: formData
  });

  try {
    await request<MediaResponse>(`/admin/media/${uploadedAsset.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        altText: "Smoke test uploaded asset"
      })
    });
  } finally {
    await request(`/admin/media/${uploadedAsset.id}`, {
      method: "DELETE"
    });
  }
}

async function testLogoutRoute() {
  await request("/auth/logout", {
    method: "POST"
  });

  authCookie = "";
  await expectFailure("/auth/me", 401);
}

async function run() {
  console.log(`Smoke testing ${baseUrl}`);

  const healthResponse = await fetch(healthUrl);
  const healthPayload = (await healthResponse.json()) as ApiEnvelope<{
    status: string;
    services: {
      api: string;
      database: string;
    };
  }>;

  assert(healthResponse.ok, "Health check returned a non-200 response.");
  assert(healthPayload.data?.services.database === "ok", "Database health check failed.");

  await testPublicRoutes();
  await testAuthRoutes();
  await testProfileRoute();
  await testContactsRoutes();
  await testHomestayRoutes();
  await testServicesRoutes();
  await testClosingRoute();
  await testMediaRoutes();
  await testLogoutRoute();

  console.log("API smoke test passed.");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
