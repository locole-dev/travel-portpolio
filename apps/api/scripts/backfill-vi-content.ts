/**
 * One-off: fill empty *Vi fields by translating English source text.
 *
 * Usage (from apps/api):
 *   npx tsx scripts/backfill-vi-content.ts
 *   npx tsx scripts/backfill-vi-content.ts --dry-run
 *
 * Env:
 *   DATABASE_URL — required (Prisma)
 *   OPENAI_API_KEY — optional; uses gpt-4o-mini (or OPENAI_TRANSLATE_MODEL) for better quality
 *   OPENAI_TRANSLATE_MODEL — optional, default gpt-4o-mini
 *   LIBRETRANSLATE_URL — optional, default https://libretranslate.de/translate
 *   BACKFILL_VI_DELAY_MS — optional delay between chunk requests (default 400)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");
const DELAY_MS = Number(process.env.BACKFILL_VI_DELAY_MS ?? 400);
const LIBRE_CHUNK = 1400;
const OPENAI_MODEL = process.env.OPENAI_TRANSLATE_MODEL ?? "gpt-4o-mini";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isViUnset(vi: string | null | undefined): boolean {
  return !(vi ?? "").trim();
}

function splitIntoChunks(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxLen, text.length);
    if (end < text.length) {
      const space = text.lastIndexOf(" ", end);
      if (space > start + maxLen * 0.4) end = space;
    }
    chunks.push(text.slice(start, end));
    start = end;
    while (start < text.length && text[start] === " ") start++;
  }
  return chunks.filter((c) => c.length > 0);
}

async function openaiTranslate(text: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Translate from English to Vietnamese. Keep proper names, URLs, emails, phone numbers, and common brand/platform names unless there is a usual Vietnamese form. Output only the translation, no quotes or notes.",
        },
        { role: "user", content: text },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const out = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!out) throw new Error("Empty OpenAI response");
  return out;
}

async function libreTranslateOnce(text: string): Promise<string> {
  const url =
    process.env.LIBRETRANSLATE_URL ?? "https://libretranslate.de/translate";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "en",
      target: "vi",
      format: "text",
    }),
  });
  if (!res.ok) throw new Error(`LibreTranslate ${res.status}: ${await res.text()}`);
  const j = (await res.json()) as { translatedText?: string };
  if (!j.translatedText) throw new Error("LibreTranslate: no translatedText");
  return j.translatedText;
}

async function myMemoryTranslateOnce(text: string): Promise<string> {
  const u = new URL("https://api.mymemory.translated.net/get");
  u.searchParams.set("q", text);
  u.searchParams.set("langpair", "en|vi");
  const res = await fetch(u.toString());
  const data = (await res.json()) as {
    responseStatus: number;
    responseData?: { translatedText?: string };
    responseDetails?: string;
  };
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails ?? "MyMemory error");
  }
  const t = data.responseData?.translatedText ?? "";
  if (!t) throw new Error("MyMemory empty");
  return t;
}

async function translateChunkWithFallback(text: string): Promise<string> {
  if (process.env.OPENAI_API_KEY) return openaiTranslate(text);
  try {
    return await libreTranslateOnce(text);
  } catch {
    const sub = splitIntoChunks(text, 400);
    const parts: string[] = [];
    for (let i = 0; i < sub.length; i++) {
      parts.push(await myMemoryTranslateOnce(sub[i]));
      if (i < sub.length - 1) await sleep(DELAY_MS);
    }
    return parts.join(" ");
  }
}

async function translateEnToVi(full: string): Promise<string> {
  const paras = full.split(/\n\n+/);
  const out: string[] = [];
  for (let pi = 0; pi < paras.length; pi++) {
    const para = paras[pi];
    if (!para.trim()) {
      out.push(para);
      continue;
    }
    const useOpenAi = Boolean(process.env.OPENAI_API_KEY);
    const chunkSize = useOpenAi ? 12000 : LIBRE_CHUNK;
    const chunks = splitIntoChunks(para.trim(), chunkSize);
    const tc: string[] = [];
    for (let ci = 0; ci < chunks.length; ci++) {
      tc.push(await translateChunkWithFallback(chunks[ci]));
      if (ci < chunks.length - 1) await sleep(DELAY_MS);
    }
    out.push(tc.join(" "));
    if (pi < paras.length - 1) await sleep(DELAY_MS);
  }
  return out.join("\n\n");
}

async function fillPair(
  en: string,
  vi: string,
  label: string
): Promise<string | undefined> {
  if (!en.trim() || !isViUnset(vi)) return undefined;
  console.log(`  translate: ${label}`);
  return translateEnToVi(en);
}

async function main(): Promise<void> {
  console.log(DRY_RUN ? "Dry run (no DB writes)" : "Backfill Vietnamese fields");

  const profile = await prisma.profile.findFirst();
  if (profile) {
    const data: Record<string, string> = {};
    const pairs: [keyof typeof profile, keyof typeof profile, string][] = [
      ["fullName", "fullNameVi", "profile.fullName"],
      ["title", "titleVi", "profile.title"],
      ["shortIntro", "shortIntroVi", "profile.shortIntro"],
      ["heroPrimaryCtaLabel", "heroPrimaryCtaLabelVi", "profile.heroPrimaryCtaLabel"],
      [
        "heroSecondaryCtaLabel",
        "heroSecondaryCtaLabelVi",
        "profile.heroSecondaryCtaLabel",
      ],
    ];
    for (const [enK, viK, label] of pairs) {
      const t = await fillPair(
        profile[enK] as string,
        profile[viK] as string,
        label
      );
      if (t !== undefined) data[viK as string] = t;
    }
    if (Object.keys(data).length) {
      if (!DRY_RUN) {
        await prisma.profile.update({ where: { id: profile.id }, data });
      }
      console.log(`Profile: ${Object.keys(data).join(", ")}`);
    }
  }

  const contacts = await prisma.contactMethod.findMany();
  for (const c of contacts) {
    if (!isViUnset(c.labelVi) || !c.label.trim()) continue;
    console.log(`  translate: contact ${c.platform} label`);
    const labelVi = await translateEnToVi(c.label);
    if (!DRY_RUN) {
      await prisma.contactMethod.update({
        where: { id: c.id },
        data: { labelVi },
      });
    }
  }

  const homestay = await prisma.homestaySection.findFirst();
  if (homestay) {
    const data: Record<string, string> = {};
    const fields: [string, string, string][] = [
      [homestay.title, homestay.titleVi, "homestay.title"],
      [
        homestay.previewDescription,
        homestay.previewDescriptionVi,
        "homestay.previewDescription",
      ],
      [homestay.description, homestay.descriptionVi, "homestay.description"],
    ];
    for (const [en, vi, label] of fields) {
      const t = await fillPair(en, vi, label);
      if (t !== undefined) {
        if (label.endsWith("title")) data.titleVi = t;
        else if (label.includes("preview")) data.previewDescriptionVi = t;
        else data.descriptionVi = t;
      }
    }
    if (homestay.locationLabel?.trim() && isViUnset(homestay.locationLabelVi)) {
      console.log("  translate: homestay.locationLabel");
      data.locationLabelVi = await translateEnToVi(homestay.locationLabel);
    }
    if (
      homestay.seasonalRatesNote?.trim() &&
      isViUnset(homestay.seasonalRatesNoteVi)
    ) {
      console.log("  translate: homestay.seasonalRatesNote");
      data.seasonalRatesNoteVi = await translateEnToVi(
        homestay.seasonalRatesNote
      );
    }
    if (Object.keys(data).length) {
      if (!DRY_RUN) {
        await prisma.homestaySection.update({
          where: { id: homestay.id },
          data,
        });
      }
      console.log(`HomestaySection: ${Object.keys(data).join(", ")}`);
    }

    const images = await prisma.homestayImage.findMany({
      where: { homestaySectionId: homestay.id },
    });
    for (const img of images) {
      if (!isViUnset(img.altTextVi) || !img.altText.trim()) continue;
      console.log(`  translate: homestay image ${img.id} altText`);
      const altTextVi = await translateEnToVi(img.altText);
      if (!DRY_RUN) {
        await prisma.homestayImage.update({
          where: { id: img.id },
          data: { altTextVi },
        });
      }
    }
  }

  const services = await prisma.serviceItem.findMany();
  for (const s of services) {
    const data: Record<string, string> = {};
    const tTitle = await fillPair(s.title, s.titleVi, `service ${s.id} title`);
    if (tTitle !== undefined) data.titleVi = tTitle;
    const tDesc = await fillPair(
      s.description,
      s.descriptionVi,
      `service ${s.id} description`
    );
    if (tDesc !== undefined) data.descriptionVi = tDesc;
    if (
      s.ctaLabel?.trim() &&
      isViUnset(s.ctaLabelVi)
    ) {
      console.log(`  translate: service ${s.id} ctaLabel`);
      data.ctaLabelVi = await translateEnToVi(s.ctaLabel);
    }
    if (Object.keys(data).length && !DRY_RUN) {
      await prisma.serviceItem.update({ where: { id: s.id }, data });
    }
    if (Object.keys(data).length) {
      console.log(`Service ${s.id}: ${Object.keys(data).join(", ")}`);
    }
  }

  const closing = await prisma.closingSection.findFirst();
  if (closing) {
    const data: Record<string, string> = {};
    const tTitle = await fillPair(
      closing.title,
      closing.titleVi,
      "closing.title"
    );
    if (tTitle !== undefined) data.titleVi = tTitle;
    const tMsg = await fillPair(
      closing.message,
      closing.messageVi,
      "closing.message"
    );
    if (tMsg !== undefined) data.messageVi = tMsg;
    const tCta = await fillPair(
      closing.ctaLabel,
      closing.ctaLabelVi,
      "closing.ctaLabel"
    );
    if (tCta !== undefined) data.ctaLabelVi = tCta;
    if (Object.keys(data).length) {
      if (!DRY_RUN) {
        await prisma.closingSection.update({
          where: { id: closing.id },
          data,
        });
      }
      console.log(`ClosingSection: ${Object.keys(data).join(", ")}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
