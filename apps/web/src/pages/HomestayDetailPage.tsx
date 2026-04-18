import { useCallback, useEffect, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { apiRequest, resolveMediaUrl } from "../lib/api";
import { useResource } from "../hooks/useResource";
import type { SiteContent } from "../types/content";
import { Button } from "../components/ui/Button";
import { LoadingBlock } from "../components/ui/LoadingBlock";
import { StatusBanner } from "../components/ui/StatusBanner";
import { useI18n } from "../i18n/I18nContext";

/** Matches `index.html` — never clear `document.title` to empty or the tab shows the URL (e.g. localhost). */
const DEFAULT_DOCUMENT_TITLE = "Nguyen Thanh Hoang";

function sortHomestayImages(images: NonNullable<SiteContent["homestay"]>["images"]) {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

export function HomestayDetailPage() {
  const { t, locale } = useI18n();
  const loadContent = useCallback(
    () => apiRequest<SiteContent>(`/public/site-content?locale=${locale}`),
    [locale]
  );
  const { data, loading, error } = useResource(loadContent);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!data) {
      document.title = DEFAULT_DOCUMENT_TITLE;
      return () => {
        document.title = DEFAULT_DOCUMENT_TITLE;
      };
    }

    const stayTitle = data.homestay?.title?.trim();
    const suffix = t("homestayPage.docTitleSuffix");
    if (stayTitle) {
      document.title = `${stayTitle} · ${suffix}`;
    } else if (data.profile.fullName) {
      document.title = `${data.profile.fullName} · ${suffix}`;
    } else {
      document.title = DEFAULT_DOCUMENT_TITLE;
    }

    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [data, t]);

  if (loading) {
    return <LoadingBlock label={t("loading.stay")} variant="home" />;
  }

  if (!data || error) {
    return (
      <div className="container-shell py-16">
        <StatusBanner tone="error" message={error ?? t("errors.contentLoad")} />
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm font-bold text-primary hover:underline">
            {t("homestayPage.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  const profile = data.profile;
  const homestay = data.homestay;
  const sortedImages = homestay ? sortHomestayImages(homestay.images) : [];
  const heroImage = sortedImages[0];
  const galleryImages = sortedImages.slice(1);

  if (!homestay) {
    return (
      <div className="relative min-h-screen bg-surface">
        <header className="border-b border-outline-variant/10 bg-white/80 backdrop-blur-md">
          <div className="container-shell flex items-center justify-between py-4">
            <Link to="/" className="font-display text-lg font-black text-primary md:text-xl">
              {profile.fullName}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-on-surface/60 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("nav.home")}
            </Link>
          </div>
        </header>
        <div className="container-shell py-20 text-center">
          <p className="text-lg text-on-surface/60">{t("homestayPage.notAvailable")}</p>
          <Button href="/" variant="primary" className="mt-8 inline-block">
            {t("homestayPage.returnHome")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface selection:bg-primary/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_20%_10%,rgba(253,186,116,0.28),transparent_42%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.22),transparent_38%),radial-gradient(circle_at_50%_35%,rgba(244,114,182,0.1),transparent_48%)]" />

      <header className="sticky top-0 z-50 border-b border-outline-variant/10 bg-white/85 backdrop-blur-xl">
        <div className="container-shell flex items-center justify-between gap-4 py-4">
          <Link
            to="/"
            className="font-display text-lg font-black tracking-tight text-primary md:text-xl"
          >
            {profile.fullName}
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium text-on-surface/70 md:flex">
            <Link to="/" className="rounded-full px-3 py-2 hover:text-primary">
              {t("nav.home")}
            </Link>
            <a href="/#experiences" className="rounded-full px-3 py-2 hover:text-primary">
              {t("nav.experiences")}
            </a>
            <span className="rounded-full bg-primary/10 px-3 py-2 font-semibold text-primary">
              {t("nav.stays")}
            </span>
            <a href="/#reviews" className="rounded-full px-3 py-2 hover:text-primary">
              {t("nav.reviews")}
            </a>
            <a href="/#contact" className="rounded-full px-3 py-2 hover:text-primary">
              {t("nav.contact")}
            </a>
          </nav>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold text-on-surface/55 hover:text-primary md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("homestayPage.back")}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative w-full">
        <div className="relative aspect-[21/9] min-h-[280px] w-full md:min-h-[420px]">
          {heroImage ? (
            <img
              src={resolveMediaUrl(heroImage.imageUrl)}
              alt={heroImage.altText}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-br from-primary/15 via-surface to-secondary/10 md:min-h-[420px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 container-shell pb-10 pt-24 md:pb-14">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-label !mb-2 text-white/90"
            >
              {t("homestayPage.aboutStay")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl"
            >
              {homestay.title}
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <article className="container-shell relative py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="section-copy whitespace-pre-wrap text-lg leading-relaxed text-on-surface/75 md:text-xl">
            {homestay.description}
          </p>
        </div>
      </article>

      {homestay.latitude != null && homestay.longitude != null ? (
        <section className="container-shell relative border-t border-outline-variant/10 pb-12 pt-4 md:pb-16 md:pt-8">
          <h2 className="font-display text-2xl font-black tracking-tight text-on-surface md:text-3xl">
            {t("homestayPage.location")}
          </h2>
          {homestay.locationLabel?.trim() ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface/60">
              {homestay.locationLabel}
            </p>
          ) : (
            <p className="mt-2 text-sm text-on-surface/45">{t("homestayPage.mapDefaultCaption")}</p>
          )}
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-outline-variant/15 bg-surface-container shadow-lg shadow-on-surface/5">
            <iframe
              title={t("homestayPage.mapIframeTitle")}
              className="aspect-video min-h-[260px] w-full md:min-h-[340px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${homestay.latitude},${homestay.longitude}&z=15&output=embed`}
            />
          </div>
        </section>
      ) : null}

      {homestay.seasonalRatesNote?.trim() ? (
        <section className="container-shell relative border-t border-outline-variant/10 pb-12 pt-12 md:pb-16 md:pt-16">
          <h2 className="font-display text-2xl font-black tracking-tight text-on-surface md:text-3xl">
            {t("homestayPage.ratesTitle")}
          </h2>
          <div className="mx-auto mt-6 max-w-3xl">
            <p className="section-copy whitespace-pre-wrap text-lg leading-relaxed text-on-surface/75 md:text-xl">
              {homestay.seasonalRatesNote}
            </p>
          </div>
        </section>
      ) : null}

      {/* Gallery (remaining images) */}
      {galleryImages.length > 0 ? (
        <section className="container-shell relative border-t border-outline-variant/10 pb-24 pt-12 md:pb-32 md:pt-16">
          <h2 className="font-display text-2xl font-black tracking-tight text-on-surface md:text-3xl">
            {t("homestayPage.galleryTitle")}
          </h2>
          <p className="mt-2 text-sm text-on-surface/50">{t("homestayPage.gallerySubtitle")}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                className="overflow-hidden rounded-[2rem] bg-surface-container shadow-lg shadow-on-surface/5"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={resolveMediaUrl(img.imageUrl)}
                    alt={img.altText}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="border-t border-outline-variant/10 bg-white/40 py-10">
        <div className="container-shell flex flex-col items-center justify-between gap-4 text-sm text-on-surface/50 md:flex-row">
          <p className="font-display font-bold text-primary">{profile.fullName}</p>
          <Link to="/" className="font-bold text-primary hover:underline">
            {t("homestayPage.backToSite")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
