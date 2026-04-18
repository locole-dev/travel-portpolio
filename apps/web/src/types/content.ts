export type AdminUser = {
  id: string;
  email: string;
  role: string;
};

export type Profile = {
  id: string;
  fullName: string;
  fullNameVi?: string;
  title: string;
  titleVi?: string;
  shortIntro: string;
  shortIntroVi?: string;
  avatarImage: string | null;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaLabelVi?: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaLabelVi?: string;
  heroSecondaryCtaLink: string;
  /** When set, public site-content resolves primary hero label/link from this contact if active. */
  heroPrimaryContactId?: string | null;
  heroSecondaryContactId?: string | null;
  updatedAt?: string;
};

export type ContactMethod = {
  id: string;
  platform: string;
  label: string;
  labelVi?: string;
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
  altTextVi?: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type HomestaySection = {
  id: string;
  title: string;
  titleVi?: string;
  /** Short copy for the homepage homestay block */
  previewDescription: string;
  previewDescriptionVi?: string;
  /** Full story on /homestay */
  description: string;
  descriptionVi?: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  locationLabelVi?: string;
  seasonalRatesNote: string | null;
  seasonalRatesNoteVi?: string;
  images: HomestayImage[];
};

export type ServiceItem = {
  id: string;
  title: string;
  titleVi?: string;
  description: string;
  descriptionVi?: string;
  icon: string;
  ctaLabel?: string | null;
  ctaLabelVi?: string;
  ctaLink?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type ClosingSection = {
  id: string;
  title: string;
  titleVi?: string;
  message: string;
  messageVi?: string;
  ctaLabel: string;
  ctaLabelVi?: string;
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
