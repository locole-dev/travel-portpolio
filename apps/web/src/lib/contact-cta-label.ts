import type { PublicLocale } from "./public-locale";

const EMAIL_PLATFORMS = new Set(["mail", "email", "gmail"]);

function humanizePlatform(platform: string): string {
  const p = platform.toLowerCase();
  const map: Record<string, string> = {
    whatsapp: "WhatsApp",
    kakaotalk: "KakaoTalk",
    zalo: "Zalo",
    line: "Line",
    instagram: "Instagram",
    wechat: "WeChat",
    gmail: "Gmail",
    mail: "Email",
    email: "Email"
  };
  return map[p] ?? platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
}

/** Hero CTA label for a contact (kept in sync with API `contact-cta-label.ts`). */
export function contactCtaLabel(c: { platform: string }, locale: PublicLocale = "en"): string {
  const p = c.platform.toLowerCase();
  if (EMAIL_PLATFORMS.has(p)) {
    return locale === "vi" ? "Gửi email" : "Send email";
  }
  if (locale === "vi") {
    return `Nhắn qua ${humanizePlatform(c.platform)}`;
  }
  return `Chat on ${humanizePlatform(c.platform)}`;
}
