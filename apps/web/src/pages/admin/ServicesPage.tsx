import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Sparkles, Save } from "lucide-react";
import { motion } from "framer-motion";

import { apiRequest } from "../../lib/api";
import { iconOptions } from "../../lib/options";
import type { ServiceItem } from "../../types/content";
import { useResource } from "../../hooks/useResource";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { LoadingBlock } from "../../components/ui/LoadingBlock";
import { StatusBanner } from "../../components/ui/StatusBanner";

const createEmptyService = (): Omit<ServiceItem, "id"> => ({
  title: "",
  titleVi: "",
  description: "",
  descriptionVi: "",
  icon: "map",
  ctaLabel: "",
  ctaLabelVi: "",
  ctaLink: "",
  isActive: true,
  sortOrder: 0
});

export function ServicesPage() {
  const loadServices = useCallback(() => apiRequest<ServiceItem[]>("/admin/services"), []);
  const { data, loading, error, refresh } = useResource(loadServices);
  const [form, setForm] = useState(createEmptyService());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingId) {
      setForm(createEmptyService());
      return;
    }

    const current = data?.find((item) => item.id === editingId);
    if (current) {
      setForm({
        title: current.title,
        titleVi: current.titleVi ?? "",
        description: current.description,
        descriptionVi: current.descriptionVi ?? "",
        icon: current.icon,
        ctaLabel: current.ctaLabel ?? "",
        ctaLabelVi: current.ctaLabelVi ?? "",
        ctaLink: current.ctaLink ?? "",
        isActive: current.isActive,
        sortOrder: current.sortOrder
      });
    }
  }, [data, editingId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await apiRequest(editingId ? `/admin/services/${editingId}` : "/admin/services", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          ctaLabel: form.ctaLabel || null,
          ctaLink: form.ctaLink || null
        })
      });
      setEditingId(null);
      setForm(createEmptyService());
      await refresh({ silent: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this service item?")) {
      return;
    }

    try {
      await apiRequest(`/admin/services/${id}`, { method: "DELETE" });
      if (editingId === id) {
        setEditingId(null);
      }
      await refresh({ silent: true });
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading services..." variant="split-form" />;
  }

  if (!data) {
    return (
      <StatusBanner tone="error" message={error ?? "Services could not be loaded."} />
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
            EXPERIENCE BUILDER
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-black tracking-tight text-on-surface">
            Services & Support
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface/50">
            Design the cards that showcase your local expertise. Transport, tours, and care.
          </p>
        </div>
        
        <Button 
          onClick={() => { setEditingId(null); setForm(createEmptyService()); }}
          className="!h-14 !px-8 !rounded-2xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Service
        </Button>
      </div>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_400px] min-w-0">
        {/* Left: List View */}
        <div className="space-y-4">
           {data.map((service) => (
              <Card 
                key={service.id} 
                className={`group flex items-start gap-6 p-6 border-none shadow-card transition-all cursor-pointer hover:bg-white ${editingId === service.id ? 'ring-2 ring-primary ring-offset-4' : ''}`}
                onClick={() => setEditingId(service.id)}
              >
                 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-container/50 text-on-surface/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Sparkles className="h-6 w-6" />
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                       <h3 className="font-bold text-on-surface text-lg truncate">{service.title}</h3>
                       {!service.isActive && (
                         <span className="rounded-full bg-on-surface/5 px-2 py-0.5 text-[8px] font-black uppercase text-on-surface/30">HIDDEN</span>
                       )}
                    </div>
                    <p className="mt-1 text-sm text-on-surface/40 line-clamp-2 leading-relaxed">{service.description}</p>
                 </div>

                 <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingId(service.id); }}
                      className="h-9 w-9 rounded-xl bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                       <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); void handleDelete(service.id); }}
                      className="h-9 w-9 rounded-xl bg-surface-container flex items-center justify-center hover:bg-tertiary hover:text-white transition-colors"
                    >
                       <Trash2 className="h-4 w-4" />
                    </button>
                 </div>
              </Card>
           ))}
        </div>

        {/* Right: Editor Card */}
        <div className="flex flex-col gap-6">
           <Card className="sticky top-6 p-8 border-none shadow-card bg-white">
              <div className="flex items-center gap-4 mb-8">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Pencil className="h-5 w-5" />
                 </div>
                 <h3 className="font-display text-xl font-black text-on-surface">
                    {editingId ? "Edit Service" : "New Service"}
                 </h3>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                 <Field label="Service Header">
                    <input
                      className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.title}
                      placeholder="e.g. Airport Transfer"
                      onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                      required
                    />
                 </Field>

                 <Field label="Service Header (Vietnamese, optional)">
                    <input
                      className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.titleVi ?? ""}
                      placeholder="Tiêu đề tiếng Việt"
                      onChange={(e) => setForm(p => ({ ...p, titleVi: e.target.value }))}
                    />
                 </Field>

                 <Field label="Brief Description">
                    <textarea
                      className="min-h-32 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 p-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.description}
                      placeholder="Describe what guests can expect..."
                      onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                      required
                    />
                 </Field>

                 <Field label="Brief Description (Vietnamese, optional)">
                    <textarea
                      className="min-h-24 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 p-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.descriptionVi ?? ""}
                      placeholder="Mô tả ngắn…"
                      onChange={(e) => setForm(p => ({ ...p, descriptionVi: e.target.value }))}
                    />
                 </Field>

                 <div className="grid grid-cols-2 gap-4">
                    <Field label="Icon Style">
                      <select
                        className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-sm font-bold outline-none focus:bg-white"
                        value={form.icon}
                        onChange={(e) => setForm(p => ({ ...p, icon: e.target.value }))}
                      >
                        {iconOptions.map((opt) => (
                           <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Priority">
                       <input
                        type="number"
                        className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-sm font-bold outline-none focus:bg-white"
                        value={form.sortOrder}
                        onChange={(e) => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) }))}
                      />
                    </Field>
                 </div>

                 <div className="flex flex-col gap-4 p-4 rounded-2xl bg-surface-container/30 border border-outline-variant/20">
                    <p className="text-[10px] font-black uppercase tracking-wider text-on-surface/30">CTA Settings (Optional)</p>
                    <input
                      className="h-10 w-full rounded-xl border border-outline-variant/30 bg-white px-4 text-xs font-bold outline-none"
                      placeholder="Button Label"
                      value={form.ctaLabel ?? ""}
                      onChange={(e) => setForm(p => ({ ...p, ctaLabel: e.target.value }))}
                    />
                    <input
                      className="h-10 w-full rounded-xl border border-outline-variant/30 bg-white px-4 text-xs font-bold outline-none"
                      placeholder="Button Label (VI, optional)"
                      value={form.ctaLabelVi ?? ""}
                      onChange={(e) => setForm(p => ({ ...p, ctaLabelVi: e.target.value }))}
                    />
                    <input
                      className="h-10 w-full rounded-xl border border-outline-variant/30 bg-white px-4 text-xs font-bold outline-none"
                      placeholder="Link (URL or Path)"
                      value={form.ctaLink ?? ""}
                      onChange={(e) => setForm(p => ({ ...p, ctaLink: e.target.value }))}
                    />
                 </div>

                 <button 
                  type="button"
                  onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                  className="flex items-center gap-3 group"
                 >
                    <div className={`h-6 w-11 rounded-full transition-colors relative ${form.isActive ? 'bg-primary' : 'bg-on-surface/10'}`}>
                       <motion.div animate={{ x: form.isActive ? 22 : 2 }} className="absolute top-0.5 h-5 w-5 bg-white rounded-full shadow-sm" />
                    </div>
                    <span className="text-sm font-bold text-on-surface/60 group-hover:text-on-surface transition-colors">Visible on Site</span>
                 </button>

                 <div className="flex gap-3">
                    <Button type="submit" disabled={submitting} className="flex-1 !h-14 !rounded-xl">
                      <Save className="h-4 w-4 mr-2" />
                      {submitting ? "Saving..." : "Save Item"}
                    </Button>
                    {editingId && (
                       <Button 
                        variant="secondary" 
                        onClick={() => setEditingId(null)}
                        className="!h-14 !w-14 !rounded-xl flex items-center justify-center"
                       >
                          <Plus className="h-5 w-5 rotate-45" />
                       </Button>
                    )}
                 </div>
              </form>
           </Card>
        </div>
      </div>
    </div>
  );
}

