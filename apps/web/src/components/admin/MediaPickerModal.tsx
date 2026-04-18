import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

import { apiRequest, resolveMediaUrl } from "../../lib/api";
import type { MediaAsset } from "../../types/content";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";

type MediaPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  media: MediaAsset[];
  onSelect: (asset: MediaAsset) => void;
  /** Called after a successful upload so the parent can refetch `media`. */
  onMediaListChange?: () => unknown | Promise<unknown>;
  title?: string;
};

export function MediaPickerModal({
  isOpen,
  onClose,
  media,
  onSelect,
  onMediaListChange,
  title = "Choose from media library"
}: MediaPickerModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleEscape]);

  useEffect(() => {
    if (!isOpen) {
      setUploadError(null);
      setUploadAltText("");
    }
  }, [isOpen]);

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const asset = await apiRequest<MediaAsset>("/admin/media", {
        method: "POST",
        body: formData
      });

      if (uploadAltText.trim()) {
        await apiRequest(`/admin/media/${asset.id}`, {
          method: "PATCH",
          body: JSON.stringify({ altText: uploadAltText.trim() })
        });
        const updated = { ...asset, altText: uploadAltText.trim() };
        await onMediaListChange?.();
        onSelect(updated);
      } else {
        await onMediaListChange?.();
        onSelect(asset);
      }
      onClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-outline-variant/15 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-4">
          <h2 id="media-picker-title" className="font-display text-xl font-black text-on-surface">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface/50 transition hover:bg-surface-container hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-outline-variant/10 px-6 py-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-on-surface/40">
            Upload new
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => void handleFileSelected(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={uploading}
                className="w-full !rounded-xl sm:w-auto"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                {uploading ? "Uploading…" : "Choose file"}
              </Button>
            </div>
            <div className="min-w-0 flex-1">
              <Field label="Alt text (optional)">
                <input
                  className="h-11 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-3 text-xs font-medium outline-none focus:bg-white focus:ring-4 focus:ring-primary/5"
                  value={uploadAltText}
                  placeholder="After upload"
                  onChange={(e) => setUploadAltText(e.target.value)}
                />
              </Field>
            </div>
          </div>
          {uploadError ? (
            <p className="mt-2 text-xs font-bold text-red-600">{uploadError}</p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {media.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface/45">
              No assets yet. Upload an image above or add files in Media Library.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group overflow-hidden rounded-2xl border-2 border-transparent bg-surface-container/30 text-left ring-primary/0 transition hover:border-primary/40 hover:ring-2 hover:ring-primary/15"
                >
                  <div className="aspect-square overflow-hidden bg-surface-container">
                    <img
                      src={resolveMediaUrl(item.publicUrl)}
                      alt={item.altText ?? item.originalName}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <p className="truncate px-2 py-2 text-[10px] font-bold text-on-surface/50">
                    {item.originalName}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
