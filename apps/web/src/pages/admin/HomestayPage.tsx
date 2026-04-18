import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pencil,
  Save,
  Trash2,
  FileText,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  UploadCloud,
  Eye,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { apiRequest, resolveMediaUrl } from "../../lib/api";
import type { HomestayImage, HomestaySection, MediaAsset } from "../../types/content";
import { useResource } from "../../hooks/useResource";
import { MediaPickerModal } from "../../components/admin/MediaPickerModal";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { LoadingBlock } from "../../components/ui/LoadingBlock";
import { StatusBanner } from "../../components/ui/StatusBanner";

type HomestayPageData = {
  homestay: HomestaySection;
  media: MediaAsset[];
};

function nextGallerySortOrder(images: HomestayImage[]) {
  if (images.length === 0) return 0;
  return Math.max(...images.map((i) => i.sortOrder)) + 1;
}

function defaultAltFromAsset(asset: MediaAsset) {
  const raw = asset.altText?.trim() || asset.originalName.replace(/\.[^.]+$/, "") || "Gallery image";
  return raw.slice(0, 180);
}

/** Display pair for the location field */
function formatCoords(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "";
  return `${lat}, ${lng}`;
}

/**
 * Parse pasted coordinates: "21.03, 105.85", "21.03 105.85", tab/semicolon-separated, etc.
 */
function parseCoordinates(raw: string): { lat: number; lng: number } | null {
  const t = raw.trim();
  if (!t) return null;
  const parts = t.split(/[\s,;]+/).filter((p) => p.length > 0);
  if (parts.length < 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function HomestayPage() {
  const loadHomestay = useCallback(async () => {
    const [homestay, media] = await Promise.all([
      apiRequest<HomestaySection>("/admin/homestay"),
      apiRequest<MediaAsset[]>("/admin/media")
    ]);

    return {
      homestay,
      media
    };
  }, []);

  const { data, loading, error, refresh } = useResource<HomestayPageData>(loadHomestay);
  const [sectionForm, setSectionForm] = useState({
    title: "",
    previewDescription: "",
    description: "",
    isActive: true,
    latitude: null as number | null,
    longitude: null as number | null,
    locationLabel: null as string | null,
    seasonalRatesNote: null as string | null
  });
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replaceImageId, setReplaceImageId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<HomestayImage | null>(null);
  const [editAltDraft, setEditAltDraft] = useState("");
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const addGalleryFileRef = useRef<HTMLInputElement>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [seasonalModalOpen, setSeasonalModalOpen] = useState(false);
  const [locationDraft, setLocationDraft] = useState({ coords: "" });
  const [seasonalDraft, setSeasonalDraft] = useState("");
  const [quickModalBusy, setQuickModalBusy] = useState(false);
  const [quickModalError, setQuickModalError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.homestay) {
      const h = data.homestay;
      setSectionForm({
        title: h.title,
        previewDescription: h.previewDescription,
        description: h.description,
        isActive: h.isActive,
        latitude: h.latitude ?? null,
        longitude: h.longitude ?? null,
        locationLabel: h.locationLabel ?? null,
        seasonalRatesNote: h.seasonalRatesNote ?? null
      });
    }
  }, [data]);

  useEffect(() => {
    if (editingImage) {
      setEditAltDraft(editingImage.altText);
    }
  }, [editingImage]);

  async function persistHomestay(next: typeof sectionForm) {
    await apiRequest("/admin/homestay", {
      method: "PUT",
      body: JSON.stringify(next)
    });
    setSectionForm(next);
    setStatus("Changes saved successfully!");
    await refresh({ silent: true });
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await persistHomestay(sectionForm);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(value: boolean) {
    const next = { ...sectionForm, isActive: value };
    try {
      await persistHomestay(next);
    } catch (err) {
      console.error(err);
    }
  }

  function openLocationModal() {
    setQuickModalError(null);
    setLocationDraft({
      coords: formatCoords(sectionForm.latitude, sectionForm.longitude)
    });
    setLocationModalOpen(true);
  }

  function openSeasonalModal() {
    setQuickModalError(null);
    setSeasonalDraft(sectionForm.seasonalRatesNote ?? "");
    setSeasonalModalOpen(true);
  }

  function useBrowserLocation() {
    if (!navigator.geolocation) {
      setQuickModalError("Geolocation is not supported in this browser.");
      return;
    }
    setQuickModalError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLocationDraft({ coords: `${lat}, ${lng}` });
      },
      () => setQuickModalError("Could not read your location. Enter coordinates manually."),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  async function saveLocationModal() {
    setQuickModalError(null);
    const parsed = parseCoordinates(locationDraft.coords);
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (locationDraft.coords.trim() !== "") {
      if (!parsed) {
        setQuickModalError(
          "Paste two numbers: latitude then longitude (e.g. 21.0285, 105.8542 from Google Maps)."
        );
        return;
      }
      latitude = parsed.lat;
      longitude = parsed.lng;
    }
    const next = {
      ...sectionForm,
      latitude,
      longitude
    };
    setQuickModalBusy(true);
    try {
      await persistHomestay(next);
      setLocationModalOpen(false);
    } catch (err) {
      setQuickModalError(err instanceof Error ? err.message : "Could not save location.");
    } finally {
      setQuickModalBusy(false);
    }
  }

  async function saveSeasonalModal() {
    setQuickModalError(null);
    const next = {
      ...sectionForm,
      seasonalRatesNote: seasonalDraft.trim() ? seasonalDraft.trim() : null
    };
    setQuickModalBusy(true);
    try {
      await persistHomestay(next);
      setSeasonalModalOpen(false);
    } catch (err) {
      setQuickModalError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setQuickModalBusy(false);
    }
  }

  async function handleGalleryPickerSelect(asset: MediaAsset) {
    if (!data) return;
    setGalleryError(null);
    setGalleryBusy(true);
    const altText = defaultAltFromAsset(asset);
    try {
      if (replaceImageId) {
        const altForPatch =
          editAltDraft.trim().length >= 2 ? editAltDraft.trim() : altText;
        await apiRequest<HomestayImage>(`/admin/homestay-images/${replaceImageId}`, {
          method: "PATCH",
          body: JSON.stringify({
            imageUrl: asset.publicUrl,
            altText: altForPatch
          })
        });
        setReplaceImageId(null);
        setEditingImage(null);
        setStatus("Gallery image updated.");
      } else {
        const sortOrder = nextGallerySortOrder(data.homestay.images);
        await apiRequest<HomestayImage>("/admin/homestay-images", {
          method: "POST",
          body: JSON.stringify({
            imageUrl: asset.publicUrl,
            altText,
            sortOrder
          })
        });
        setStatus("Image added to gallery.");
      }
      await refresh({ silent: true });
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "Could not update gallery.");
    } finally {
      setGalleryBusy(false);
    }
  }

  async function uploadThenAddGalleryImage(file: File | undefined) {
    if (!file || !data) return;
    setGalleryError(null);
    setGalleryBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const asset = await apiRequest<MediaAsset>("/admin/media", {
        method: "POST",
        body: formData
      });
      const altText = defaultAltFromAsset(asset);
      const sortOrder = nextGallerySortOrder(data.homestay.images);
      await apiRequest("/admin/homestay-images", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: asset.publicUrl,
          altText,
          sortOrder
        })
      });
      setStatus("Image uploaded and added to gallery.");
      await refresh({ silent: true });
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setGalleryBusy(false);
      if (addGalleryFileRef.current) addGalleryFileRef.current.value = "";
    }
  }

  async function saveEditAlt() {
    if (!editingImage) return;
    setGalleryError(null);
    setGalleryBusy(true);
    try {
      await apiRequest(`/admin/homestay-images/${editingImage.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          altText: editAltDraft.trim()
        })
      });
      setEditingImage(null);
      setStatus("Image details saved.");
      await refresh({ silent: true });
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setGalleryBusy(false);
    }
  }

  async function deleteGalleryImage(id: string) {
    if (!window.confirm("Remove this image from the gallery?")) return;
    setGalleryError(null);
    try {
      await apiRequest(`/admin/homestay-images/${id}`, { method: "DELETE" });
      if (editingImage?.id === id) setEditingImage(null);
      setStatus("Image removed.");
      await refresh({ silent: true });
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  function openReplacePickerFromEditor() {
    if (!editingImage) return;
    const id = editingImage.id;
    const alt = editAltDraft;
    setEditingImage(null);
    setReplaceImageId(id);
    setEditAltDraft(alt);
    setPickerOpen(true);
  }

  if (loading) {
    return <LoadingBlock label="Loading homestay content..." variant="split-form" />;
  }

  if (!data) {
    return (
      <StatusBanner tone="error" message={error ?? "Homestay content could not be loaded."} />
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setReplaceImageId(null);
        }}
        media={data.media}
        title={replaceImageId ? "Replace gallery image" : "Add image from library"}
        onMediaListChange={() => void refresh({ silent: true })}
        onSelect={(asset) => void handleGalleryPickerSelect(asset)}
      />

      {editingImage ? (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <Card className="relative w-full max-w-md border-none p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setEditingImage(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-on-surface/40 hover:bg-surface-container hover:text-on-surface"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl font-black text-on-surface">Edit gallery image</h3>
            <div className="mt-4 overflow-hidden rounded-2xl bg-surface-container">
              <img
                src={resolveMediaUrl(editingImage.imageUrl)}
                alt=""
                className="aspect-video w-full object-cover"
              />
            </div>
            <div className="mt-6">
              <Field label="Alt text">
                <input
                  className="h-12 w-full rounded-xl border border-outline-variant/30 bg-white px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5"
                  value={editAltDraft}
                  onChange={(e) => setEditAltDraft(e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={galleryBusy}
                className="flex-1 !rounded-xl"
                onClick={() => void saveEditAlt()}
              >
                Save alt text
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={galleryBusy}
                className="flex-1 !rounded-xl"
                onClick={openReplacePickerFromEditor}
              >
                Change image
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {locationModalOpen ? (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-modal-title"
        >
          <Card className="relative w-full max-w-md border-none p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setLocationModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-on-surface/40 hover:bg-surface-container hover:text-on-surface"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 id="location-modal-title" className="font-display text-xl font-black text-on-surface">
              Update location
            </h3>
            <p className="mt-2 text-sm text-on-surface/50">
              Paste latitude and longitude together (e.g. from Google Maps), or use your current position. Leave
              empty to hide the map on the public stay page.
            </p>
            {quickModalError ? (
              <p className="mt-3 text-sm font-bold text-red-600">{quickModalError}</p>
            ) : null}
            <div className="mt-6">
              <Field
                label="Coordinates"
                help="Format: latitude, longitude — spaces or commas are fine."
              >
                <input
                  className="h-12 w-full rounded-xl border border-outline-variant/30 bg-white px-4 font-mono text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="e.g. 21.028511, 105.854103"
                  value={locationDraft.coords}
                  onChange={(e) => setLocationDraft({ coords: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="!rounded-xl"
                disabled={quickModalBusy}
                onClick={() => useBrowserLocation()}
              >
                Use my location
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="!rounded-xl"
                disabled={quickModalBusy}
                onClick={() => {
                  setLocationDraft({ coords: "" });
                  setQuickModalError(null);
                }}
              >
                Clear
              </Button>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={quickModalBusy}
                className="flex-1 !rounded-xl"
                onClick={() => void saveLocationModal()}
              >
                {quickModalBusy ? "Saving…" : "Save location"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={quickModalBusy}
                className="flex-1 !rounded-xl"
                onClick={() => setLocationModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {seasonalModalOpen ? (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="seasonal-modal-title"
        >
          <Card className="relative w-full max-w-lg border-none p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSeasonalModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-on-surface/40 hover:bg-surface-container hover:text-on-surface"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 id="seasonal-modal-title" className="font-display text-xl font-black text-on-surface">
              Seasonal rates
            </h3>
            <p className="mt-2 text-sm text-on-surface/50">
              Describe low/high season pricing, minimum nights, or rules. This text appears on the public stay page.
            </p>
            {quickModalError ? (
              <p className="mt-3 text-sm font-bold text-red-600">{quickModalError}</p>
            ) : null}
            <div className="mt-6">
              <Field label="Pricing notes">
                <textarea
                  className="min-h-40 w-full rounded-xl border border-outline-variant/30 bg-white p-4 text-sm font-medium leading-relaxed outline-none focus:ring-4 focus:ring-primary/5"
                  placeholder="e.g. Low season (May–Sep): from $35/night. Peak (Dec–Jan): from $55/night, 2-night minimum."
                  value={seasonalDraft}
                  onChange={(e) => setSeasonalDraft(e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={quickModalBusy}
                className="flex-1 !rounded-xl"
                onClick={() => void saveSeasonalModal()}
              >
                {quickModalBusy ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={quickModalBusy}
                className="flex-1 !rounded-xl"
                onClick={() => setSeasonalModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
            MANAGEMENT HUB
          </p>
          <h2 className="mt-3 font-display text-5xl font-black tracking-tight text-on-surface">
            TwentyNine Homestay
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface/50">
            Refine your homestay's presence. Every detail here shapes the guest's first impression.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/homestay"
            target="_blank"
            rel="noreferrer"
            className="button-secondary inline-flex !h-14 items-center !rounded-2xl !bg-surface-container/50 !px-8 border-none group"
          >
            <Eye className="mr-2 h-5 w-5 transition-colors group-hover:text-primary" />
            Preview Live
          </Link>
          <Button onClick={handleSave} disabled={submitting} className="!h-14 !px-8 !rounded-2xl">
            <Save className="h-5 w-5 mr-2" />
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {status ? (
        <p className="mb-6 text-sm font-bold text-green-700">{status}</p>
      ) : null}
      {galleryError ? (
        <p className="mb-6 text-sm font-bold text-red-600">{galleryError}</p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_minmax(0,0.9fr)]">
        {/* Left: Section Details */}
        <div className="flex flex-col gap-8">
           <Card className="p-8 border-none shadow-card">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-black text-on-surface">Core Information</h3>
              </div>

              <div className="grid gap-8">
                <Field label="Section Title">
                   <input
                    className="h-14 w-full rounded-xl border border-outline-variant/30 bg-white px-5 text-base font-medium outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm(p => ({ ...p, title: e.target.value }))}
                  />
                </Field>

                <Field
                  label="Preview description (homepage)"
                  help="Short teaser for the home page (max 500 characters)."
                >
                  <textarea
                    className="min-h-28 w-full rounded-xl border border-outline-variant/30 bg-white p-5 text-base font-medium leading-relaxed text-on-surface/70 outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                    maxLength={500}
                    value={sectionForm.previewDescription}
                    onChange={(e) =>
                      setSectionForm((p) => ({ ...p, previewDescription: e.target.value }))
                    }
                  />
                  <p className="mt-1 text-xs text-on-surface/40">
                    {sectionForm.previewDescription.length}/500
                  </p>
                </Field>

                <Field
                  label="Full description (stay detail page)"
                  help="Long-form story shown on /homestay (max 10,000 characters)."
                >
                  <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container/30">
                     <div className="flex items-center gap-1 border-b border-outline-variant/30 bg-surface-container/50 px-3 py-2">
                        {['B', 'I', 'U', 'S'].map(t => (
                          <button key={t} type="button" className="h-8 w-8 rounded-lg text-xs font-bold hover:bg-white">{t}</button>
                        ))}
                     </div>
                     <textarea
                      className="min-h-64 w-full bg-white p-6 text-base font-medium leading-[1.8] text-on-surface/70 outline-none"
                      maxLength={10000}
                      value={sectionForm.description}
                      onChange={(e) => setSectionForm(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                  <p className="mt-1 text-xs text-on-surface/40">
                    {sectionForm.description.length}/10000
                  </p>
                </Field>
              </div>
           </Card>

           {/* Quick Actions */}
           <div className="grid gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={openLocationModal}
                className="glass-card group flex w-full cursor-pointer items-center gap-5 border-none p-6 text-left shadow-card transition-colors hover:bg-white"
              >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#D6F5F9] text-[#006479]">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Update Location</h4>
                    <p className="mt-1 text-xs font-bold text-on-surface/30">Pin your coordinates</p>
                  </div>
              </button>
              <button
                type="button"
                onClick={openSeasonalModal}
                className="glass-card group flex w-full cursor-pointer items-center gap-5 border-none p-6 text-left shadow-card transition-colors hover:bg-white"
              >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FDF2F0] text-[#A03A0F]">
                    <DollarSign className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Seasonal Rates</h4>
                    <p className="mt-1 text-xs font-bold text-on-surface/30">Adjust pricing logic</p>
                  </div>
              </button>
           </div>
        </div>

        {/* Right: Media Gallery */}
        <div className="flex flex-col gap-8">
           <Card className="p-8 border-none shadow-card">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-black text-on-surface">Media Gallery</h3>
                </div>
                <span className="rounded-full bg-on-surface/5 px-3 py-1 text-[10px] font-bold text-on-surface/40">
                  {data.homestay.images.length} Images
                </span>
              </div>

              <input
                ref={addGalleryFileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => void uploadThenAddGalleryImage(e.target.files?.[0])}
              />

              <div className="grid grid-cols-2 gap-4">
                 {data.homestay.images.map((image) => (
                    <div key={image.id} className="group relative aspect-square overflow-hidden rounded-[2rem] bg-surface-container">
                       <img 
                        src={resolveMediaUrl(image.imageUrl)} 
                        alt={image.altText} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                       />
                       <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            className="h-10 w-10 rounded-full bg-white text-on-surface flex items-center justify-center shadow-lg hover:scale-110"
                            onClick={() => {
                              setEditingImage(image);
                              setEditAltDraft(image.altText);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="h-10 w-10 rounded-full bg-white text-tertiary flex items-center justify-center shadow-lg hover:scale-110"
                            onClick={() => void deleteGalleryImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                 ))}
                 <div className="flex aspect-square flex-col gap-2">
                   <button
                     type="button"
                     disabled={galleryBusy}
                     onClick={() => addGalleryFileRef.current?.click()}
                     className="group relative flex flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-[2rem] border-2 border-dashed border-outline-variant/50 bg-surface-container/20 transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                   >
                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                       <UploadCloud className="h-5 w-5" />
                     </div>
                     <div className="text-center px-2">
                       <p className="text-sm font-bold text-on-surface">Upload</p>
                       <p className="text-[10px] text-on-surface/40">New file</p>
                     </div>
                   </button>
                   <button
                     type="button"
                     disabled={galleryBusy}
                     onClick={() => {
                       setReplaceImageId(null);
                       setPickerOpen(true);
                     }}
                     className="group flex flex-1 flex-col items-center justify-center gap-2 rounded-[2rem] border border-outline-variant/30 bg-white py-3 transition hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                   >
                     <ImageIcon className="h-5 w-5 text-primary/70" />
                     <span className="text-[11px] font-bold text-on-surface/70">From library</span>
                   </button>
                 </div>
              </div>
           </Card>

           {/* Live Status Toggle */}
           <Card className="p-6 rounded-[2.5rem] border-none shadow-card relative overflow-hidden bg-white">
              <div className="absolute left-0 inset-y-0 w-1.5 bg-[#006479]" />
              <div className="flex flex-row items-center justify-between gap-4 px-2">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006479]">LIVE STATUS</p>
                    <h4 className="mt-1 font-display text-xl font-black text-on-surface">
                       {sectionForm.isActive ? "Currently Published" : "Hidden from Public"}
                    </h4>
                 </div>
                 <button 
                  type="button"
                  onClick={() => toggleStatus(!sectionForm.isActive)}
                  className={`relative h-10 w-18 rounded-full transition-colors ${sectionForm.isActive ? 'bg-[#006479]' : 'bg-on-surface/10'}`}
                 >
                    <motion.div 
                      animate={{ x: sectionForm.isActive ? 34 : 4 }}
                      className="h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center"
                    />
                 </button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

