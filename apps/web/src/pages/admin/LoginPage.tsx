import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, LogIn } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { LoadingBlock } from "../../components/ui/LoadingBlock";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { MOCK_API_ENABLED } from "../../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <LoadingBlock label="Checking your admin session..." variant="auth" />;
  }

  if (!loading && user) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_minmax(0,0.85fr)]">
        <Card className="hidden overflow-hidden lg:block">
          <div className="relative h-full min-h-[560px] p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.22),transparent_30%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="font-display text-6xl leading-none text-plum">
                  TwentyNine
                </p>
                <p className="mt-4 max-w-md text-lg leading-8 text-ink/75">
                  Manage your profile, services, and homestay content from one calm,
                  colorful admin dashboard.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-3xl bg-white/75 px-5 py-4 text-sm text-ink/75">
                  Update hero details, CTAs, contact links, and transport offerings.
                </div>
                <div className="rounded-3xl bg-white/75 px-5 py-4 text-sm text-ink/75">
                  Upload photos once and reuse them across the site.
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender/70 text-plum">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-plum">Admin Login</p>
              <p className="text-sm text-ink/65">
                Sign in to manage the public website content.
              </p>
            </div>
          </div>

          {MOCK_API_ENABLED ? (
            <StatusBanner
              tone="info"
              message="Mock mode is enabled. This admin login runs entirely in the frontend."
            />
          ) : null}

          {error ? <StatusBanner tone="error" message={error} /> : null}

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            <Field label="Email">
              <input
                className="input-base"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </Field>

            <Field label="Password">
              <input
                className="input-base"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </Field>

            <Button type="submit" className="w-full justify-center" disabled={submitting}>
              <LogIn className="h-4 w-4" />
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
