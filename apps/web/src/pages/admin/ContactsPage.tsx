import { useCallback, useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  MessageSquare,
  Save,
  Globe,
  Mail,
  Phone,
  Link as LinkIcon
} from "lucide-react";
import { motion } from "framer-motion";

import { apiRequest } from "../../lib/api";
import { contactPlatformOptions } from "../../lib/options";
import type { ContactMethod } from "../../types/content";
import { useResource } from "../../hooks/useResource";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { LoadingBlock } from "../../components/ui/LoadingBlock";
import { StatusBanner } from "../../components/ui/StatusBanner";

const createEmptyContact = (): Omit<ContactMethod, "id"> => ({
  platform: "gmail",
  label: "",
  labelVi: "",
  value: "",
  link: "",
  icon: "mail",
  isActive: true,
  sortOrder: 0
});

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'gmail': return Mail;
    case 'whatsapp': return MessageSquare;
    case 'phone': return Phone;
    case 'website': return Globe;
    default: return LinkIcon;
  }
};

export function ContactsPage() {
  const loadContacts = useCallback(() => apiRequest<ContactMethod[]>("/admin/contacts"), []);
  const { data, loading, error, refresh } = useResource(loadContacts);
  const [form, setForm] = useState(createEmptyContact());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingId) {
      setForm(createEmptyContact());
      return;
    }

    const current = data?.find((item) => item.id === editingId);
    if (current) {
      setForm({
        platform: current.platform,
        label: current.label,
        value: current.value ?? "",
        link: current.link,
        icon: current.icon,
        isActive: current.isActive,
        sortOrder: current.sortOrder
      });
    }
  }, [data, editingId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await apiRequest(editingId ? `/admin/contacts/${editingId}` : "/admin/contacts", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          value: form.value || null
        })
      });

      setEditingId(null);
      setForm(createEmptyContact());
      await refresh({ silent: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this contact method?")) {
      return;
    }

    try {
      await apiRequest(`/admin/contacts/${id}`, { method: "DELETE" });
      if (editingId === id) {
        setEditingId(null);
      }
      await refresh({ silent: true });
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading contacts..." variant="split-form" />;
  }

  if (!data) {
    return (
      <StatusBanner tone="error" message={error ?? "Contacts could not be loaded."} />
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
            COMMUNICATION
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-black tracking-tight text-on-surface">
            Contact Channels
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface/50">
            Manage the ways guests can reach you. Provide direct links to social profiles or messaging apps.
          </p>
        </div>
        
        <Button 
          onClick={() => { setEditingId(null); setForm(createEmptyContact()); }}
          className="!h-14 !px-8 !rounded-2xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Channel
        </Button>
      </div>

      <div className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-[1fr_400px] min-w-0">
        {/* Left: Contact List */}
        <div className="space-y-4">
           {data.map((contact) => {
              const Icon = getPlatformIcon(contact.platform);
              return (
                <Card 
                  key={contact.id} 
                  className={`group flex items-center gap-6 p-6 border-none shadow-card transition-all cursor-pointer hover:bg-white ${editingId === contact.id ? 'ring-2 ring-primary ring-offset-4' : ''}`}
                  onClick={() => setEditingId(contact.id)}
                >
                   <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-container/50 text-on-surface/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon className="h-6 w-6" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                         <h3 className="font-bold text-on-surface text-lg truncate">{contact.label}</h3>
                         {!contact.isActive && (
                           <span className="rounded-full bg-on-surface/5 px-2 py-0.5 text-[8px] font-black uppercase text-on-surface/30">HIDDEN</span>
                         )}
                      </div>
                      <p className="mt-1 text-sm text-on-surface/40 truncate font-mono uppercase tracking-wider">{contact.platform}</p>
                   </div>

                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingId(contact.id); }}
                        className="h-9 w-9 rounded-xl bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      >
                         <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); void handleDelete(contact.id); }}
                        className="h-9 w-9 rounded-xl bg-surface-container flex items-center justify-center hover:bg-tertiary hover:text-white transition-colors"
                      >
                         <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </Card>
              );
           })}
        </div>

        {/* Right: Channel Editor */}
        <div className="flex flex-col gap-6">
           <Card className="sticky top-6 p-8 border-none shadow-card bg-white">
              <div className="flex items-center gap-4 mb-8">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Pencil className="h-5 w-5" />
                 </div>
                 <h3 className="font-display text-xl font-black text-on-surface">
                    {editingId ? "Edit Channel" : "New Channel"}
                 </h3>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-6">
                 <div className="grid grid-cols-2 gap-4">
                    <Field label="Platform">
                      <select
                        className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-xs font-bold outline-none focus:bg-white"
                        value={form.platform}
                        onChange={(e) => setForm(p => ({ ...p, platform: e.target.value }))}
                      >
                        {contactPlatformOptions.map((opt) => (
                           <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Priority">
                       <input
                        type="number"
                        className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-xs font-bold outline-none focus:bg-white"
                        value={form.sortOrder}
                        onChange={(e) => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) }))}
                      />
                    </Field>
                 </div>

                 <Field label="Display Label">
                    <input
                      className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.label}
                      placeholder="e.g. WhatsApp"
                      onChange={(e) => setForm(p => ({ ...p, label: e.target.value }))}
                      required
                    />
                 </Field>

                 <Field label="Display Label (Vietnamese, optional)">
                    <input
                      className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.labelVi ?? ""}
                      placeholder="e.g. Zalo"
                      onChange={(e) => setForm(p => ({ ...p, labelVi: e.target.value }))}
                    />
                 </Field>

                 <Field label="Direct Link / URL">
                    <input
                      className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.link}
                      placeholder="https://wa.me/..."
                      onChange={(e) => setForm(p => ({ ...p, link: e.target.value }))}
                      required
                    />
                 </Field>

                 <Field label="Display Value (Optional)">
                    <input
                      className="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container/20 px-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.value ?? ""}
                      placeholder="e.g. +84 123 456 789"
                      onChange={(e) => setForm(p => ({ ...p, value: e.target.value }))}
                    />
                 </Field>

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

                 <div className="flex gap-3 mt-4">
                    <Button type="submit" disabled={submitting} className="flex-1 !h-14 !rounded-xl">
                      <Save className="h-4 w-4 mr-2" />
                      {submitting ? "Saving..." : "Save Channel"}
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

