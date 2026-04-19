import { useCallback, useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  UploadCloud,
  CheckCircle2,
  XCircle
} from "lucide-react";

import { apiRequest, resolveMediaUrl } from "../../lib/api";
import type { MediaAsset } from "../../types/content";
import { useResource } from "../../hooks/useResource";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { LoadingBlock } from "../../components/ui/LoadingBlock";
import { StatusBanner } from "../../components/ui/StatusBanner";

export function MediaPage() {
  const loadMedia = useCallback(() => apiRequest<MediaAsset[]>("/admin/media"), []);
  const { data, loading, error, refresh } = useResource(loadMedia);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const selected = data?.find((item) => item.id === selectedId);
    setAltText(selected?.altText ?? "");
  }, [data, selectedId]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadFile) {
      setSubmitError("Choose an image before uploading.");
      return;
    }

    setSubmitError(null);
    setStatus(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const asset = await apiRequest<MediaAsset>("/admin/media", {
        method: "POST",
        body: formData
      });

      if (uploadAltText.trim()) {
        await apiRequest(`/admin/media/${asset.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            altText: uploadAltText.trim()
          })
        });
      }

      setUploadFile(null);
      setUploadAltText("");
      setStatus("Media uploaded successfully!");
      await refresh({ silent: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to upload media.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveAltText() {
    if (!selectedId) {
      return;
    }

    setSubmitError(null);
    setStatus(null);

    try {
      await apiRequest(`/admin/media/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({
          altText
        })
      });
      setStatus("Media details updated.");
      setSelectedId(null);
      await refresh({ silent: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to update media.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this media item?")) {
      return;
    }

    try {
      await apiRequest(`/admin/media/${id}`, { method: "DELETE" });
      setStatus("Media item deleted.");
      if (selectedId === id) {
        setSelectedId(null);
      }
      await refresh({ silent: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to delete media.");
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading media library..." variant="media" />;
  }

  if (!data) {
    return (
      <StatusBanner tone="error" message={error ?? "Media library could not be loaded."} />
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
       {/* Header Area */}
       <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
          ASSET MANAGEMENT
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-black tracking-tight text-on-surface">
          Media Library
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface/50">
          Upload and manage high-quality assets for your homestay profile. Use consistent
          alt text for better accessibility.
        </p>
      </div>

      {status ? (
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-green-50 px-6 py-4 text-sm font-bold text-green-700">
           <CheckCircle2 className="h-5 w-5" />
           {status}
        </div>
      ) : null}
      {submitError ? (
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 px-6 py-4 text-sm font-bold text-red-700">
           <XCircle className="h-5 w-5" />
           {submitError}
        </div>
      ) : null}

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_320px] min-w-0">
        {/* Gallery Grid */}
        <div className="space-y-6">
           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((item) => (
                <Card 
                  key={item.id} 
                  className={`group overflow-hidden p-0 border-none shadow-card ring-2 transition-all ${selectedId === item.id ? 'ring-primary' : 'ring-transparent'}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                    <img
                      src={resolveMediaUrl(item.publicUrl)}
                      alt={item.altText ?? item.originalName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => setSelectedId(item.id)} 
                        className="h-9 w-9 rounded-full bg-white text-on-surface flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                       >
                          <Pencil className="h-4 w-4" />
                       </button>
                       <button 
                        onClick={() => void handleDelete(item.id)}
                        className="h-9 w-9 rounded-full bg-white text-tertiary flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                       >
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="truncate text-xs font-bold text-on-surface">{item.originalName}</p>
                    <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-on-surface/30">
                      {item.altText || "No Alt Text"}
                    </p>
                  </div>
                </Card>
              ))}
           </div>
        </div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-6">
           {/* Upload Form */}
           <Card className="p-8 border-none shadow-card bg-white">
              <h3 className="font-display text-lg font-black text-on-surface mb-6">Quick Upload</h3>
              <form onSubmit={handleUpload} className="grid grid-cols-1 gap-5">
                 <div className="relative group">
                    <input
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    />
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/50 bg-surface-container/30 px-4 py-8 group-hover:bg-primary/5 group-hover:border-primary/30 transition-all">
                       <UploadCloud className="h-8 w-8 text-primary/40 group-hover:scale-120 transition-transform" />
                       <p className="mt-3 text-[10px] font-bold text-on-surface/40 text-center">
                          {uploadFile ? uploadFile.name : "Select an image file"}
                       </p>
                    </div>
                 </div>

                 <Field label="Description (Alt Text)">
                    <input
                      className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5"
                      value={uploadAltText}
                      placeholder="e.g. Host portrait in garden"
                      onChange={(e) => setUploadAltText(e.target.value)}
                    />
                 </Field>

                 <Button type="submit" disabled={uploading} className="w-full !rounded-xl !h-12">
                   {uploading ? "Uploading..." : "Upload Asset"}
                 </Button>
              </form>
           </Card>

           {/* Selected Item Edit */}
           {selectedId && (
              <Card className="p-8 border-none shadow-card bg-primary/5 animate-in fade-in slide-in-from-right-4 duration-300">
                 <h3 className="font-display text-lg font-black text-primary mb-6">Edit Asset</h3>
                 <div className="grid grid-cols-1 gap-5">
                    <Field label="Alt Text">
                       <textarea
                        className="min-h-24 w-full rounded-xl border border-primary/10 bg-white p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                      />
                    </Field>
                    <div className="flex gap-2">
                       <Button onClick={handleSaveAltText} className="flex-1 !rounded-xl !h-12">
                         Save
                       </Button>
                       <Button variant="secondary" onClick={() => setSelectedId(null)} className="flex-1 !rounded-xl !h-12">
                         Cancel
                       </Button>
                    </div>
                 </div>
              </Card>
           )}
        </div>
      </div>
    </div>
  );
}

