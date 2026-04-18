import type { HomestayMediaKind } from "../types/content";
import { resolveMediaUrl } from "../lib/api";

type Props = {
  imageUrl: string;
  alt: string;
  mediaKind?: HomestayMediaKind;
  className?: string;
};

export function HomestayGalleryMedia({ imageUrl, alt, mediaKind = "IMAGE", className = "" }: Props) {
  const src = resolveMediaUrl(imageUrl);
  if (mediaKind === "VIDEO") {
    return (
      <video
        src={src}
        className={className}
        controls
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }
  return <img src={src} alt={alt} className={className} />;
}
