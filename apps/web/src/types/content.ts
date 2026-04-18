export type AdminUser = {
  id: string;
  email: string;
  role: string;
};

export type Profile = {
  id: string;
  fullName: string;
  title: string;
  shortIntro: string;
  avatarImage: string | null;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaLink: string;
  updatedAt?: string;
};

export type ContactMethod = {
  id: string;
  platform: string;
  label: string;
  value?: string | null;
  link: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type HomestayImage = {
  id: string;
  homestaySectionId: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type HomestaySection = {
  id: string;
  title: string;
  /** Short copy for the homepage homestay block */
  previewDescription: string;
  /** Full story on /homestay */
  description: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  seasonalRatesNote: string | null;
  images: HomestayImage[];
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type ClosingSection = {
  id: string;
  title: string;
  message: string;
  ctaLabel: string;
  ctaLink: string;
};

export type MediaAsset = {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  publicUrl: string;
  altText?: string | null;
  uploadedById?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SiteContent = {
  profile: Profile;
  contacts: ContactMethod[];
  homestay: HomestaySection | null;
  services: ServiceItem[];
  closing: ClosingSection;
};
