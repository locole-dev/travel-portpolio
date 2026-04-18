import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Link2, Save, User, Laptop, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

import { apiRequest, resolveMediaUrl } from "../../lib/api";
import type { ContactMethod, MediaAsset, Profile } from "../../types/content";
import { useResource } from "../../hooks/useResource";
import { HeroCtaSelect, contactCtaLabel } from "../../components/admin/HeroCtaSelect";
import { MediaPickerModal } from "../../components/admin/MediaPickerModal";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { LoadingBlock } from "../../components/ui/LoadingBlock";
import { StatusBanner } from "../../components/ui/StatusBanner";

type ProfilePageData = {
  profile: Profile;
  media: MediaAsset[];
  contacts: ContactMethod[];
};

/** In-page / app routes for hero buttons (same as public site anchors). */
const HERO_PAGE_PRESETS: ReadonlyArray<{ id: string; label: string; link: string }> = [
  { id: "homestay-anchor", label: "See the Homestay", link: "#homestay" },
  { id: "homestay-page", label: "Stay details", link: "/homestay" },
  { id: "contact-anchor", label: "Contact", link: "#contact" },
  { id: "home-anchor", label: "Home", link: "#home" }
];

function normalizeUrl(a: string) {
  return a.trim();
}

function encodeCtaChoice(
  link: string,
  contacts: ContactMethod[],
  presets: typeof HERO_PAGE_PRESETS
): string {
  const n = normalizeUrl(link);
  const contact = contacts.find((c) => normalizeUrl(c.link) === n);
  if (contact) return `c:${contact.id}`;
  const preset = presets.find((p) => p.link === n);
  if (preset) return `p:${preset.id}`;
  return "custom";
}

const emptyForm: Profile = {
  id: "",
  fullName: "",
  title: "",
  shortIntro: "",
  avatarImage: "",
  heroPrimaryCtaLabel: "",
  heroPrimaryCtaLink: "",
  heroSecondaryCtaLabel: "",
  heroSecondaryCtaLink: ""
};

export function ProfilePage() {
  const loadProfile = useCallback(async () => {
    const [profile, media, contacts] = await Promise.all([
      apiRequest<Profile>("/admin/profile"),
      apiRequest<MediaAsset[]>("/admin/media"),
      apiRequest<ContactMethod[]>("/admin/contacts")
    ]);

    return {
      profile,
      media,
      contacts
    };
  }, []);

  const { data, loading, error, refresh } = useResource<ProfilePageData>(loadProfile);
  const [form, setForm] = useState<Profile>(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  /** Only sync form from server on first load or after Discard — not after silent refetch (avoids wiping unsaved avatar). */
  const profileHydratedRef = useRef(false);

  useEffect(() => {
    if (!data?.profile) return;
    if (!profileHydratedRef.current) {
      setForm(data.profile);
      profileHydratedRef.current = true;
    }
  }, [data]);

  const activeContacts = useMemo(
    () =>
      (data?.contacts ?? [])
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [data?.contacts]
  );

  const primaryChoice = encodeCtaChoice(form.heroPrimaryCtaLink, activeContacts, HERO_PAGE_PRESETS);
  const secondaryChoice = encodeCtaChoice(
    form.heroSecondaryCtaLink,
    activeContacts,
    HERO_PAGE_PRESETS
  );

  function applyPrimaryChoice(encoded: string) {
    if (encoded === "custom") return;
    if (encoded.startsWith("c:")) {
      const id = encoded.slice(2);
      const c = activeContacts.find((x) => x.id === id);
      if (c) {
        setForm((f) => ({
          ...f,
          heroPrimaryCtaLabel: contactCtaLabel(c),
          heroPrimaryCtaLink: c.link
        }));
      }
      return;
    }
    if (encoded.startsWith("p:")) {
      const id = encoded.slice(2);
      const p = HERO_PAGE_PRESETS.find((x) => x.id === id);
      if (p) {
        setForm((f) => ({
          ...f,
          heroPrimaryCtaLabel: p.label,
          heroPrimaryCtaLink: p.link
        }));
      }
    }
  }

  function applySecondaryChoice(encoded: string) {
    if (encoded === "custom") return;
    if (encoded.startsWith("c:")) {
      const id = encoded.slice(2);
      const c = activeContacts.find((x) => x.id === id);
      if (c) {
        setForm((f) => ({
          ...f,
          heroSecondaryCtaLabel: contactCtaLabel(c),
          heroSecondaryCtaLink: c.link
        }));
      }
      return;
    }
    if (encoded.startsWith("p:")) {
      const id = encoded.slice(2);
      const p = HERO_PAGE_PRESETS.find((x) => x.id === id);
      if (p) {
        setForm((f) => ({
          ...f,
          heroSecondaryCtaLabel: p.label,
          heroSecondaryCtaLink: p.link
        }));
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setSubmitError(null);

    try {
      const updated = await apiRequest<Profile>("/admin/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.fullName,
          title: form.title,
          shortIntro: form.shortIntro,
          avatarImage: form.avatarImage?.trim() ? form.avatarImage.trim() : null,
          heroPrimaryCtaLabel: form.heroPrimaryCtaLabel,
          heroPrimaryCtaLink: form.heroPrimaryCtaLink,
          heroSecondaryCtaLabel: form.heroSecondaryCtaLabel,
          heroSecondaryCtaLink: form.heroSecondaryCtaLink
        })
      });

      setForm(updated);
      setStatus("Changes saved successfully!");
      await refresh({ silent: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadAvatarFile(file: File | undefined) {
    if (!file) return;
    setAvatarUploading(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const asset = await apiRequest<MediaAsset>("/admin/media", {
        method: "POST",
        body: formData
      });
      setForm((current) => ({ ...current, avatarImage: asset.publicUrl }));
      setStatus("Photo uploaded — save changes to publish.");
      await refresh({ silent: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setAvatarUploading(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = "";
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading profile content..." variant="form" />;
  }

  if (!data) {
    return (
      <StatusBanner tone="error" message={error ?? "Profile could not be loaded."} />
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        media={data.media}
        title="Choose profile photo"
        onMediaListChange={() => void refresh({ silent: true })}
        onSelect={(asset) => {
          setForm((current) => ({ ...current, avatarImage: asset.publicUrl }));
          setStatus("Photo selected — save changes to publish.");
        }}
      />

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
          MANAGEMENT HUB
        </p>
        <h2 className="mt-3 font-display text-5xl font-black tracking-tight text-on-surface">
          Edit Public Profile
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface/50">
          Craft your professional identity. This information will be displayed to guests on
          your public homestay portfolio page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Sidebar: Profile Photo */}
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-6 text-center border-none shadow-card">
             <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-[2.5rem] bg-surface-container">
               {form.avatarImage ? (
                 <img 
                   src={resolveMediaUrl(form.avatarImage)} 
                   alt="Avatar" 
                   className="h-full w-full object-cover"
                 />
               ) : (
                 <div className="flex h-full w-full items-center justify-center text-on-surface/20">
                   <User className="h-16 w-16" />
                 </div>
               )}
             </div>
             <div className="mt-6 flex flex-col items-center gap-3">
               <input
                 ref={avatarFileInputRef}
                 type="file"
                 accept="image/png,image/jpeg,image/webp,image/svg+xml"
                 className="hidden"
                 onChange={(e) => void uploadAvatarFile(e.target.files?.[0])}
               />
               <button
                 type="button"
                 disabled={avatarUploading}
                 onClick={() => avatarFileInputRef.current?.click()}
                 className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-60"
               >
                 <UploadCloud className="h-4 w-4" />
                 {avatarUploading ? "Uploading…" : "Upload New Photo"}
               </button>
               <button
                 type="button"
                 onClick={() => setPickerOpen(true)}
                 className="flex w-full items-center justify-center gap-2 rounded-pill border border-outline-variant/40 bg-white px-4 py-3 text-sm font-bold text-on-surface/80 shadow-sm transition hover:border-primary/30 hover:text-primary"
               >
                 <ImageIcon className="h-4 w-4" />
                 Choose from library
               </button>
               {form.avatarImage ? (
                 <button
                   type="button"
                   onClick={() => {
                     setForm((current) => ({ ...current, avatarImage: "" }));
                     setStatus("Photo removed — save changes to apply.");
                   }}
                   className="text-xs font-bold text-on-surface/40 underline-offset-2 hover:text-tertiary hover:underline"
                 >
                   Remove photo
                 </button>
               ) : null}
               <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface/30">
                 JPG, PNG or WEBP. Max 5MB.<br />Square aspect ratio recommended.
               </p>
             </div>
          </Card>

          <Card className="p-6 border-none shadow-card">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface/40">
              PROFILE STRENGTH
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-on-surface/5">
              <div className="h-full w-[80%] bg-primary" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface/40">80% Completed</span>
              <span className="text-xs font-bold text-primary">Very Strong</span>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-8">
          <Card className="relative overflow-hidden p-8 border-none shadow-card">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-black text-on-surface">Personal Identity</h3>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Full Name">
                  <input
                    className="h-14 w-full rounded-xl border border-outline-variant/50 bg-white px-5 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                    value={form.fullName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Professional Title">
                  <input
                    className="h-14 w-full rounded-xl border border-outline-variant/50 bg-white px-5 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="Short Bio/Intro">
                <textarea
                  className="min-h-32 w-full rounded-xl border border-outline-variant/50 bg-white p-5 text-sm font-medium leading-relaxed outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  value={form.shortIntro}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, shortIntro: event.target.value }))
                  }
                />
              </Field>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-card relative z-20">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Laptop className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-black text-on-surface">Hero Interactions</h3>
            </div>

            <div className="grid gap-6">
              <p className="flex items-start gap-2 text-sm text-on-surface/55">
                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Choose a saved contact or a page link; button label and URL are set together. Manage
                channels in{" "}
                <Link to="/admin/contacts" className="font-bold text-primary hover:underline">
                  Contact Methods
                </Link>
                .
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Primary button"
                  help="Usually your main chat channel (WhatsApp, Zalo, …)."
                >
                  <HeroCtaSelect
                    value={primaryChoice}
                    onChange={applyPrimaryChoice}
                    contacts={activeContacts}
                    presets={HERO_PAGE_PRESETS}
                  />
                  {primaryChoice === "custom" ? (
                    <div className="mt-3 grid gap-3">
                      <input
                        className="h-12 w-full rounded-xl border border-outline-variant/50 bg-white px-4 text-sm font-medium outline-none focus:border-primary/50"
                        placeholder="Button label"
                        value={form.heroPrimaryCtaLabel}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            heroPrimaryCtaLabel: e.target.value
                          }))
                        }
                      />
                      <input
                        className="h-12 w-full rounded-xl border border-outline-variant/50 bg-white px-4 text-sm font-medium outline-none focus:border-primary/50"
                        placeholder="URL (https://…, mailto:, #section)"
                        value={form.heroPrimaryCtaLink}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            heroPrimaryCtaLink: e.target.value
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <p className="mt-2 truncate text-xs text-on-surface/45" title={form.heroPrimaryCtaLink}>
                      → {form.heroPrimaryCtaLink}
                    </p>
                  )}
                </Field>

                <Field
                  label="Secondary button"
                  help="Often homestay preview or Contact section."
                >
                  <HeroCtaSelect
                    value={secondaryChoice}
                    onChange={applySecondaryChoice}
                    contacts={activeContacts}
                    presets={HERO_PAGE_PRESETS}
                  />
                  {secondaryChoice === "custom" ? (
                    <div className="mt-3 grid gap-3">
                      <input
                        className="h-12 w-full rounded-xl border border-outline-variant/50 bg-white px-4 text-sm font-medium outline-none focus:border-primary/50"
                        placeholder="Button label"
                        value={form.heroSecondaryCtaLabel}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            heroSecondaryCtaLabel: e.target.value
                          }))
                        }
                      />
                      <input
                        className="h-12 w-full rounded-xl border border-outline-variant/50 bg-white px-4 text-sm font-medium outline-none focus:border-primary/50"
                        placeholder="URL"
                        value={form.heroSecondaryCtaLink}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            heroSecondaryCtaLink: e.target.value
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <p className="mt-2 truncate text-xs text-on-surface/45" title={form.heroSecondaryCtaLink}>
                      → {form.heroSecondaryCtaLink}
                    </p>
                  )}
                </Field>
              </div>
            </div>
          </Card>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-4 pb-10">
            {status ? (
              <span className="text-sm font-bold text-green-600">{status}</span>
            ) : null}
            {submitError ? (
              <span className="text-sm font-bold text-red-600">{submitError}</span>
            ) : null}
            
            <button 
              type="button"
              className="px-6 py-2 text-sm font-bold text-on-surface/40 hover:text-on-surface transition-colors"
              onClick={async () => {
                profileHydratedRef.current = false;
                await refresh({ silent: true });
              }}
            >
              Discard Changes
            </button>
            <Button
              type="submit"
              disabled={submitting}
              className="!h-14 !px-8 !rounded-xl !text-sm !font-bold shadow-xl shadow-primary/20"
            >
              <Save className="h-5 w-5 mr-2" />
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

