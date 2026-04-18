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

/** Hero CTA label for a contact (kept in sync with web `contact-cta-label.ts`). */
export function contactCtaLabel(c: { platform: string }): string {
  const p = c.platform.toLowerCase();
  if (EMAIL_PLATFORMS.has(p)) return "Send email";
  return `Chat on ${humanizePlatform(c.platform)}`;
}
