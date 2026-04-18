import { useCallback, useEffect, useState } from "react";
import { Save, Heart, Sparkles, Eye } from "lucide-react";

import { apiRequest } from "../../lib/api";
import type { ClosingSection } from "../../types/content";
import { useResource } from "../../hooks/useResource";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { LoadingBlock } from "../../components/ui/LoadingBlock";
import { StatusBanner } from "../../components/ui/StatusBanner";

const emptyClosing: ClosingSection = {
  id: "",
  title: "",
  message: "",
  ctaLabel: "",
  ctaLink: ""
};

export function ClosingPage() {
  const loadClosing = useCallback(() => apiRequest<ClosingSection>("/admin/closing"), []);
  const { data, loading, error, refresh } = useResource(loadClosing);
  const [form, setForm] = useState<ClosingSection>(emptyClosing);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await apiRequest("/admin/closing", {
        method: "PUT",
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          ctaLabel: form.ctaLabel,
          ctaLink: form.ctaLink
        })
      });
      setStatus("Changes saved successfully!");
      await refresh({ silent: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading closing section..." variant="form" />;
  }

  if (!data) {
    return (
      <StatusBanner
        tone="error"
        message={error ?? "Closing section could not be loaded."}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
       {/* Header Area */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
            FINAL TOUCHES
          </p>
          <h2 className="mt-3 font-display text-5xl font-black tracking-tight text-on-surface">
            Closing Section
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface/50">
            End the guest's journey with a warm message and a clear call to action. 
            This is your final chance to convert a visitor into a guest.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="secondary" className="!h-14 !px-8 !rounded-2xl !bg-surface-container/50 border-none group">
              <Eye className="h-5 w-5 mr-2 group-hover:text-primary transition-colors" />
              Preview
           </Button>
           <Button onClick={() => document.getElementById('closing-form')?.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}))} disabled={submitting} className="!h-14 !px-8 !rounded-2xl">
              <Save className="h-5 w-5 mr-2" />
              {submitting ? "Saving..." : "Save Changes"}
           </Button>
        </div>
      </div>

      <div className="grid gap-8">
         <Card className="p-8 border-none shadow-card bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Heart className="h-40 w-40" />
            </div>
            
            <form id="closing-form" className="relative z-10 grid gap-8" onSubmit={handleSubmit}>
               {status ? (
                 <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-6 py-4 text-sm font-bold text-green-700">
                    <Sparkles className="h-5 w-5" />
                    {status}
                 </div>
               ) : null}

               <Field label="Final Headline">
                  <input
                    className="h-14 w-full rounded-2xl border border-outline-variant/30 bg-surface-container/20 px-6 text-lg font-bold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary/5"
                    value={form.title}
                    placeholder="e.g. Can't wait to host you!"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                  />
               </Field>

               <Field label="Personal Message">
                  <textarea
                    className="min-h-48 w-full rounded-2xl border border-outline-variant/30 bg-surface-container/20 p-6 text-base font-medium leading-relaxed outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary/5"
                    value={form.message}
                    placeholder="Write a warm invitation..."
                    onChange={(event) =>
                      setForm((current) => ({ ...current, message: event.target.value }))
                    }
                  />
               </Field>

               <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Button Label">
                    <input
                      className="h-14 w-full rounded-2xl border border-outline-variant/30 bg-surface-container/20 px-6 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5"
                      value={form.ctaLabel}
                      placeholder="e.g. Book Your Stay"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, ctaLabel: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Button Link">
                    <input
                      className="h-14 w-full rounded-2xl border border-outline-variant/30 bg-surface-container/20 px-6 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5"
                      value={form.ctaLink}
                      placeholder="https://..."
                      onChange={(event) =>
                        setForm((current) => ({ ...current, ctaLink: event.target.value }))
                      }
                    />
                  </Field>
               </div>
            </form>
         </Card>
      </div>
    </div>
  );
}

