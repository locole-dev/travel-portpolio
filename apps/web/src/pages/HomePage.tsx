import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import type { IconType } from "react-icons";
import { ArrowRight, Check, Star } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { SiGmail, SiKakaotalk, SiLine, SiWechat, SiZalo } from "react-icons/si";

import { apiRequest, resolveMediaUrl } from "../lib/api";
import { useResource } from "../hooks/useResource";
import { getIcon } from "../lib/icons";
import type { ContactMethod, SiteContent } from "../types/content";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingBlock } from "../components/ui/LoadingBlock";
import { StatusBanner } from "../components/ui/StatusBanner";
import { useI18n } from "../i18n/I18nContext";

/* ── Types ── */
type NavItem = {
  id: string;
  label: string;
  href: string;
};

type ContactVisual = {
  icon: IconType;
  bgClass: string;
  iconClass: string;
};

/* ── Constants ── */
const fallbackAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80";

const contactVisuals: Record<string, ContactVisual> = {
  gmail: { icon: SiGmail, bgClass: "bg-white", iconClass: "text-[#ea4335]" },
  whatsapp: { icon: FaWhatsapp, bgClass: "bg-white", iconClass: "text-[#25d366]" },
  zalo: { icon: SiZalo, bgClass: "bg-white", iconClass: "text-[#0068ff]" },
  kakaotalk: { icon: SiKakaotalk, bgClass: "bg-white", iconClass: "text-[#3c1e1e]" },
  wechat: { icon: SiWechat, bgClass: "bg-white", iconClass: "text-[#07c160]" },
  line: { icon: SiLine, bgClass: "bg-white", iconClass: "text-[#06c755]" },
  instagram: { icon: FaInstagram, bgClass: "bg-white", iconClass: "text-[#d62976]" },
};

function getLinkProps(href: string) {
  const isExternal = /^https?:\/\//i.test(href);
  return isExternal ? { target: "_blank" as const, rel: "noreferrer" } : {};
}

function getContactVisual(contact: ContactMethod) {
  return (
    contactVisuals[contact.platform.toLowerCase()] ?? {
      icon: FaInstagram,
      bgClass: "bg-white",
      iconClass: "text-primary",
    }
  );
}

/* ── Fade-in section wrapper ── */
function RevealSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const SCROLL_LOCK_MS = 900;

/* ══════════════════════════════════════════════ */
/*  HomePage                                      */
/* ══════════════════════════════════════════════ */
export function HomePage() {
  const { t, locale, setLocale } = useI18n();

  const navItems = useMemo<NavItem[]>(
    () => [
      { id: "home", label: t("nav.home"), href: "#home" },
      { id: "experiences", label: t("nav.experiences"), href: "#experiences" },
      { id: "homestay", label: t("nav.stays"), href: "#homestay" },
      { id: "reviews", label: t("nav.reviews"), href: "#reviews" },
      { id: "contact", label: t("nav.contact"), href: "#contact" }
    ],
    [t]
  );

  /* ── Lenis smooth scroll ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
    });

    let frameId = 0;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  /* ── Data ── */
  const loadSiteContent = useCallback(
    () => apiRequest<SiteContent>(`/public/site-content?locale=${locale}`),
    [locale]
  );
  const { data, loading, error } = useResource(loadSiteContent);

  /* ── UI state (declared before any conditional return) ── */
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeNavId, setActiveNavId] = useState("home");
  const scrollLockUntilRef = useRef(0);
  const sectionRatioRef = useRef<Record<string, number>>({});

  /* ── Scroll-driven header transforms ── */
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 60], ["rgba(255,255,255,0)", "rgba(255,255,255,0.88)"]);
  const headerBlur = useTransform(scrollY, [0, 60], ["blur(0px)", "blur(24px)"]);
  const headerShadow = useTransform(scrollY, [0, 60], ["0 0 0 rgba(0,0,0,0)", "0 16px 40px rgba(19,16,34,0.08)"]);
  const headerWidth = useTransform(scrollY, [0, 60], ["94%", "100%"]);
  const headerRadius = useTransform(scrollY, [0, 60], ["28px", "0px"]);
  const headerTop = useTransform(scrollY, [0, 60], ["20px", "0px"]);

  /* ── Active section tracking (max visible ratio + ignore during programmatic scroll) ── */
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !data) return;

    const navIds = navItems.map((i) => i.id);

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < scrollLockUntilRef.current) return;

        for (const entry of entries) {
          sectionRatioRef.current[entry.target.id] = entry.intersectionRatio;
        }

        let bestId: string | null = null;
        let bestRatio = 0;
        for (const id of navIds) {
          const r = sectionRatioRef.current[id] ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }

        if (bestId && bestRatio > 0.08) {
          setActiveNavId(bestId);
        }
      },
      {
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.65, 0.8, 1],
        rootMargin: "-10% 0px -18% 0px",
      }
    );

    navIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      sectionRatioRef.current = {};
    };
  }, [data, navItems]);

  /* ── Loading / Error gates ── */
  if (loading) {
    return <LoadingBlock label={t("loading.portfolio")} variant="home" />;
  }

  if (!data) {
    return (
      <div className="container-shell py-12">
        <StatusBanner tone="error" message={error ?? t("errors.siteContent")} />
      </div>
    );
  }

  /* ── Derived data ── */
  const heroAvatar = resolveMediaUrl(data.profile.avatarImage) || fallbackAvatar;
  const homestayImages = data.homestay?.images ?? [];
  const highlightImages = homestayImages.slice(0, 5);

  /* ── Click handler for nav items ── */
  const handleNavClick = (item: NavItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollLockUntilRef.current = Date.now() + SCROLL_LOCK_MS;
    setActiveNavId(item.id);
    if (item.href === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    history.replaceState(null, "", item.href);
  };

  const activeNavIndex = Math.max(0, navItems.findIndex((i) => i.id === activeNavId));
  const pillIndex = hoveredIndex !== null ? hoveredIndex : activeNavIndex;

  /* ══════════════ JSX ══════════════ */
  return (
    <div className="relative min-h-screen max-w-full overflow-x-hidden bg-surface selection:bg-primary/20">
      {/* ── Background gradient blobs ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_20%_10%,rgba(253,186,116,0.30),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(125,211,252,0.25),transparent_35%),radial-gradient(circle_at_50%_30%,rgba(244,114,182,0.12),transparent_50%)]" />

      {/* ═══════════ HEADER ═══════════ */}
      <motion.header
        style={{
          backgroundColor: headerBg,
          backdropFilter: headerBlur,
          boxShadow: headerShadow,
          width: headerWidth,
          borderRadius: headerRadius,
          top: headerTop,
          left: "50%",
          translateX: "-50%",
        }}
        className="fixed z-50 max-w-full overflow-x-hidden transition-all duration-300"
      >
        <div className="container-shell flex min-w-0 max-w-full flex-col px-6 py-4 md:px-8">
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-3">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0 break-words font-display text-xl font-black leading-snug tracking-tight text-primary md:text-2xl"
            >
              {data.profile.fullName}
            </motion.div>

            {/* Navigation — desktop */}
            <nav
              className="hidden items-center gap-1 text-sm font-medium text-on-surface/75 md:flex"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onClick={handleNavClick(item)}
                  className="relative px-4 py-2"
                >
                  {pillIndex === index && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-primary/7"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors ${
                      activeNavId === item.id
                        ? "font-semibold text-primary"
                        : "hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.a>
              ))}
            </nav>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="shrink-0 self-start md:self-center"
            >
              <Button
                href={data.profile.heroPrimaryCtaLink}
                variant="primary"
                className="!px-4 !py-2 text-center text-xs leading-tight shadow-xl !whitespace-normal sm:!px-5 sm:text-sm"
                {...getLinkProps(data.profile.heroPrimaryCtaLink)}
              >
                {data.profile.heroPrimaryCtaLabel.trim() || t("hero.ctaFallbackPrimary")}
              </Button>
            </motion.div>
          </div>

          {/* Navigation — mobile (in-page anchors only; homestay details via “View full stay”) */}
          <nav
            className="-mx-2 mt-3 flex min-w-0 w-full max-w-full flex-wrap gap-1.5 pb-1 pt-1 md:hidden"
            aria-label="Section navigation"
          >
            {navItems.map((item) => (
              <a
                key={`mobile-${item.id}`}
                href={item.href}
                onClick={handleNavClick(item)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  activeNavId === item.id
                    ? "bg-primary/12 text-primary"
                    : "bg-on-surface/[0.04] text-on-surface/70 hover:bg-primary/8 hover:text-primary"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="flex flex-col gap-28 pb-32 pt-32 md:gap-36 md:pt-36">

        {/* ── HERO SECTION ── */}
        <section id="home" className="container-shell relative overflow-x-hidden pt-10 lg:pt-16">
          <div className="flex flex-col lg:grid items-center gap-10 lg:gap-12 lg:grid-cols-[1.1fr_minmax(0,0.9fr)]">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative z-10 flex flex-col gap-6 lg:gap-7 items-center text-center lg:items-start lg:text-left order-2 lg:order-1"
            >
              <p className="section-label !mb-0 font-bold tracking-[0.2em] text-tertiary">
                {t("hero.helloIm")}
              </p>

              <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tight text-on-surface sm:text-6xl lg:text-[4.2rem]">
                {data.profile.fullName}
              </h1>

              <p className="section-copy max-w-xl !text-base text-on-surface/65 sm:!text-lg">
                {data.profile.shortIntro}
              </p>

              <div className="mt-2 flex flex-wrap justify-center gap-4 lg:mt-0 lg:justify-start">
                <Button
                  href={data.profile.heroPrimaryCtaLink}
                  variant="primary"
                  className="px-8 py-3.5 text-base shadow-2xl"
                  {...getLinkProps(data.profile.heroPrimaryCtaLink)}
                >
                  {data.profile.heroPrimaryCtaLabel.trim() || t("hero.ctaFallbackPrimary")}
                </Button>
                <Button
                  href={data.profile.heroSecondaryCtaLink}
                  variant="secondary"
                  className="px-8 py-3.5 text-base"
                  {...getLinkProps(data.profile.heroSecondaryCtaLink)}
                >
                  {data.profile.heroSecondaryCtaLabel.trim() || t("hero.ctaFallbackSecondary")}
                </Button>
              </div>

              {/* ── INTEGRATED CONTACTS ── */}
              <div
                id="contact"
                className="w-full scroll-mt-36 md:scroll-mt-32 mt-10 pt-10 border-t border-outline-variant/15 flex flex-col items-center lg:items-start"
              >
                <h2 className="font-display text-3xl font-black tracking-tight text-on-surface mb-8">
                  {t("hero.connectTitle")}
                </h2>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8">
                  {data.contacts.map((contact, index) => {
                    const visual = getContactVisual(contact);
                    const Icon = visual.icon;

                    return (
                      <motion.a
                        key={contact.id}
                        href={contact.link}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 16,
                          delay: index * 0.04 + 0.3,
                        }}
                        viewport={{ once: true }}
                        className="group flex flex-col items-center gap-3"
                        {...getLinkProps(contact.link)}
                      >
                        <div
                          className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.8rem] ${visual.bgClass} border border-outline-variant/10 shadow-lg shadow-black/5 transition-all duration-400 group-hover:-translate-y-2 group-hover:shadow-xl`}
                        >
                          <Icon className={`h-8 w-8 ${visual.iconClass} transition-transform duration-400 group-hover:scale-110`} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface/40">
                          {contact.platform}
                        </span>
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right: Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="relative order-1 mx-auto w-full max-w-[240px] overflow-hidden sm:max-w-[300px] lg:order-2 lg:max-w-[460px]"
            >
              {/* Decorative blobs */}
              <div className="absolute -left-6 top-4 h-32 w-32 rounded-full bg-[#fda874]/40 blur-2xl lg:-left-12 lg:top-8 lg:h-48 lg:w-48 lg:blur-3xl" />
              <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-[#f472b6]/30 blur-2xl lg:-bottom-12 lg:-right-8 lg:h-56 lg:w-56 lg:blur-3xl" />

              <div className="relative overflow-hidden rounded-full border-[6px] border-white/90 bg-white shadow-xl shadow-primary/10 lg:rounded-[2.5rem] lg:border-[10px] lg:border-white/60 lg:shadow-[0_24px_72px_rgba(28,26,65,0.14)]">
                <img
                  src={heroAvatar}
                  alt={data.profile.fullName}
                  className="block aspect-square w-full object-cover lg:aspect-[3/4]"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CURATED EXPERIENCES (horizontal cards, no CTA) ── */}
        <RevealSection id="experiences" className="container-shell scroll-mt-28 md:scroll-mt-32">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl font-black tracking-tight text-on-surface md:text-5xl">
              {t("experiences.title")}
            </h2>
            <p className="section-copy mx-auto mt-4 max-w-2xl text-on-surface/60">
              {t("experiences.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 lg:gap-5">
            {data.services.map((service, index) => {
              const ServiceIcon = getIcon(service.icon);

              let cardClasses = "";
              let iconWrapperClasses = "";
              let descriptionTone = "text-on-surface/65";

              if (index === 0) {
                cardClasses =
                  "bg-[#dbeafe] border border-blue-100 shadow-sm shadow-blue-900/5";
                iconWrapperClasses = "bg-primary text-white shadow-primary/20";
              } else if (index === 1) {
                cardClasses =
                  "bg-[#fefce8] border border-yellow-100 shadow-sm shadow-yellow-900/5";
                iconWrapperClasses = "bg-secondary text-on-secondary shadow-secondary/20";
              } else if (index === 2) {
                cardClasses =
                  "bg-[#f0fdf4] border border-green-100 shadow-sm shadow-green-900/5";
                iconWrapperClasses = "bg-tertiary text-on-tertiary shadow-tertiary/20";
              } else {
                cardClasses =
                  "bg-[#fdf2f8] border border-pink-100 shadow-sm shadow-pink-900/5";
                iconWrapperClasses =
                  "bg-primary/90 text-white shadow-primary/20";
                descriptionTone = "text-on-surface/50";
              }

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="w-full min-w-0 flex-[1_1_100%] sm:flex-[1_1_calc(50%-0.5rem)] lg:flex-[1_1_calc(33.333%-0.833rem)] lg:max-w-[26rem]"
                >
                  <Card
                    className={`flex h-full flex-row items-start gap-4 rounded-[2rem] p-6 sm:gap-5 sm:p-7 ${cardClasses}`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-lg sm:h-14 sm:w-14 ${iconWrapperClasses}`}
                    >
                      <ServiceIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-black tracking-tight text-on-surface sm:text-xl">
                        {service.title}
                      </p>
                      <p className={`mt-2 text-sm leading-relaxed ${descriptionTone}`}>
                        {service.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </RevealSection>

        {/* ── HOMESTAY SECTION ── */}
        {data.homestay ? (
          <RevealSection id="homestay" className="container-shell scroll-mt-28 md:scroll-mt-32">
            <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_minmax(0,1.05fr)]">
              {/* Left: Info */}
              <div className="flex flex-col gap-6">
                <p className="section-label">{t("homestay.aboutLabel")}</p>
                <h2 className="font-display text-4xl font-black leading-none tracking-tight text-on-surface md:text-5xl">
                  {data.homestay.title}
                </h2>
                <p className="section-copy text-on-surface/65">
                  {data.homestay.previewDescription}
                </p>

                <Link
                  to="/homestay"
                  className="button-primary mt-2 inline-flex w-fit items-center gap-2 px-6 py-3 text-sm shadow-lg"
                >
                  {t("homestay.viewFullStay")}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="mt-2 grid gap-4">
                  {[
                    t("homestay.perkBreakfast"),
                    t("homestay.perkAssistance"),
                    t("homestay.perkGuides")
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-medium text-on-surface/75"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-4 w-4" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Proportional Editorial Gallery */}
              <div className="flex h-auto min-w-0 max-w-full flex-col items-stretch gap-6 md:h-[620px] md:flex-row">
                {/* ── Focal Architectural Feature (58% width) ── */}
                {highlightImages[0] && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="w-full md:w-[58%] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-on-surface/5 group relative"
                  >
                    <img
                      src={resolveMediaUrl(highlightImages[0].imageUrl)}
                      alt={highlightImages[0].altText}
                      className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                  </motion.div>
                )}

                {/* ── Stacked Detail Column (42% width) ── */}
                <div className="flex min-w-0 w-full max-w-full flex-col gap-6 md:w-[42%]">
                  {/* Top: Elegant Suite Detail */}
                  {highlightImages[1] && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      viewport={{ once: true }}
                      className="flex-1 rounded-[3.5rem] overflow-hidden shadow-xl shadow-on-surface/5 group relative"
                    >
                      <img
                        src={resolveMediaUrl(highlightImages[1].imageUrl)}
                        alt={highlightImages[1].altText}
                        className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                      />
                    </motion.div>
                  )}

                  {/* Bottom Row: Accent Pill & Details */}
                  <div className="flex h-[220px] min-w-0 max-w-full gap-4 sm:gap-6">
                    {/* The Signature Pill */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      viewport={{ once: true }}
                      className="w-[125px] flex-shrink-0 bg-primary rounded-full p-6 text-white flex flex-col items-center justify-end text-center shadow-xl shadow-primary/20 pb-10"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-50 mb-3">
                        {t("homestay.pillStay")}
                      </span>
                      <p className="font-display text-2xl font-black leading-[0.9] tracking-tighter">
                        {t("homestay.pillSuiteLine1")}
                        <br />
                        {t("homestay.pillSuiteLine2")}
                      </p>
                    </motion.div>

                    {/* Architectural Detail */}
                    {highlightImages[2] && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true }}
                        className="min-w-0 flex-1 rounded-[3.5rem] overflow-hidden shadow-xl shadow-on-surface/5 group relative"
                      >
                        <img
                          src={resolveMediaUrl(highlightImages[2].imageUrl)}
                          alt={highlightImages[2].altText}
                          className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        ) : (
          <RevealSection id="homestay" className="container-shell scroll-mt-28 py-16 text-center">
            <p className="section-label">{t("homestay.aboutLabel")}</p>
            <p className="mx-auto max-w-md text-on-surface/55">{t("homestay.emptyTitle")}</p>
          </RevealSection>
        )}

        {/* ── REVIEWS (Placeholder) ── */}
        <RevealSection id="reviews" className="container-shell scroll-mt-28 text-center md:scroll-mt-32">
          <p className="section-label">{t("reviews.label")}</p>
          <h2 className="font-display text-4xl font-black tracking-tight text-on-surface md:text-5xl">
            {t("reviews.title")}
          </h2>
          <p className="section-copy mx-auto mt-4 max-w-xl text-on-surface/60">{t("reviews.subtitle")}</p>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah M.",
                text: t("reviews.card1Quote"),
                stars: 5,
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
              },
              {
                name: "James T.",
                text: t("reviews.card2Quote"),
                stars: 5,
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
              },
              {
                name: "Yuki K.",
                text: t("reviews.card3Quote"),
                stars: 5,
                avatar: "https://images.unsplash.com/photo-1517841905240-472988bad157?q=80&w=150&auto=format&fit=crop",
              },
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="flex h-full flex-col gap-5 rounded-[2.2rem] p-8 text-left shadow-sm">
                  <div className="flex gap-1">
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm italic leading-relaxed text-on-surface/70">
                    "{review.text}"
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <img 
                      src={review.avatar} 
                      alt={review.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-primary/10" 
                    />
                    <p className="text-sm font-bold tracking-tight text-on-surface">
                      {review.name}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </RevealSection>


        {/* ── CLOSING / THANK YOU ── */}
        <RevealSection id="thanks" className="container-shell">
          <Card className="relative overflow-hidden rounded-[3.2rem] border border-white/55 px-8 py-14 text-center shadow-[0_30px_90px_rgba(35,31,71,0.10)] sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,247,237,0.74))]" />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
              {/* Avatar */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
                <img
                  src={heroAvatar}
                  alt={data.profile.fullName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>

              <h2 className="font-display text-3xl font-black leading-tight tracking-tight text-on-surface md:text-5xl">
                {data.closing.title}
              </h2>

              <p className="max-w-2xl text-base leading-8 text-on-surface/65 sm:text-lg">
                "{data.closing.message}"
              </p>
            </div>
          </Card>
        </RevealSection>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-outline-variant/10 bg-white/50 py-10">
        <div className="container-shell flex flex-col gap-6 text-sm text-on-surface/60 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-primary">
              {data.profile.fullName}
            </p>
            <p className="mt-1 max-w-md text-sm leading-6 text-on-surface/50">
              {data.profile.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {(["privacy", "terms", "cookies"] as const).map((key) => (
              <a
                key={key}
                href="#"
                className="text-sm font-medium text-on-surface/50 transition hover:text-primary"
              >
                {t(`footerPage.${key}`)}
              </a>
            ))}
          </div>
        </div>

        <div className="container-shell mt-6 flex flex-col items-center gap-4 border-t border-outline-variant/8 pt-6 text-xs text-on-surface/38 sm:flex-row sm:justify-between">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {data.profile.fullName}. {t("footerPage.rights")}
          </p>
          <div className="flex items-center gap-2 font-medium">
            <span className="text-on-surface/45">{t("footer.language")}</span>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={
                locale === "en"
                  ? "rounded-lg bg-primary/12 px-2.5 py-1 text-primary"
                  : "rounded-lg px-2.5 py-1 text-on-surface/50 transition hover:text-primary"
              }
            >
              {t("footer.enShort")}
            </button>
            <span className="text-on-surface/25">|</span>
            <button
              type="button"
              onClick={() => setLocale("vi")}
              className={
                locale === "vi"
                  ? "rounded-lg bg-primary/12 px-2.5 py-1 text-primary"
                  : "rounded-lg px-2.5 py-1 text-on-surface/50 transition hover:text-primary"
              }
            >
              {t("footer.viShort")}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
