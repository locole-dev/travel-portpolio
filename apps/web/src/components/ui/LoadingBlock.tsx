import type { ReactNode } from "react";

import { Skeleton } from "./Skeleton";

type LoadingVariant =
  | "default"
  | "home"
  | "admin-shell"
  | "dashboard"
  | "form"
  | "split-form"
  | "media"
  | "auth";

function SectionCard({
  className = "",
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`glass-card p-6 ${className}`.trim()}>{children}</div>;
}

function LineSet({ lines = 3 }: { lines?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={index === lines - 1 ? "h-4 w-2/3" : "h-4 w-full"}
        />
      ))}
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <SectionCard className="min-h-40">
      <div className="flex h-full min-h-28 flex-col justify-center gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </SectionCard>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <SectionCard className="sm:p-8">
        <div className="grid gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SectionCard key={index} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
          </SectionCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {Array.from({ length: 2 }).map((_, index) => (
          <SectionCard key={index}>
            <div className="grid gap-4">
              <Skeleton className="h-7 w-44" />
              <LineSet lines={4} />
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((__, itemIndex) => (
                  <Skeleton key={itemIndex} className="h-16 w-full rounded-3xl" />
                ))}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="grid gap-6">
      <SectionCard>
        <div className="grid gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="grid gap-5">
          <LineSet lines={2} />
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
      </SectionCard>
    </div>
  );
}

function SplitFormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <SectionCard>
        <div className="grid gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="grid gap-5">
          <LineSet lines={2} />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
      </SectionCard>
    </div>
  );
}

function MediaSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <SectionCard>
          <div className="grid gap-5">
            <Skeleton className="h-10 w-48" />
            <LineSet lines={3} />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="mt-4 h-4 w-32" />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        </SectionCard>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SectionCard key={index} className="overflow-hidden p-0">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="grid gap-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-full" />
                  <Skeleton className="h-10 flex-1 rounded-full" />
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthSkeleton() {
  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_minmax(0,0.85fr)]">
        <SectionCard className="hidden min-h-[560px] lg:block">
          <div className="flex h-full flex-col justify-between">
            <div className="grid gap-4">
              <Skeleton className="h-16 w-56" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="grid gap-3">
              <Skeleton className="h-20 w-full rounded-3xl" />
              <Skeleton className="h-20 w-full rounded-3xl" />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-6 sm:p-8">
          <div className="grid gap-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="grid gap-3">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function AdminShellSkeleton() {
  return (
    <div className="container-shell min-h-screen py-6">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <SectionCard className="hidden lg:block">
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="grid gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="grid gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard className="p-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </SectionCard>

          <DashboardSkeleton />
        </div>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container-shell pt-8">
        <SectionCard className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-8 w-32" />
            <div className="hidden gap-3 md:flex">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-11 w-36 rounded-full" />
          </div>
        </SectionCard>
      </div>

      <div className="container-shell grid gap-28 pb-32 pt-12">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
          <div className="grid gap-6">
            <Skeleton className="h-10 w-48 rounded-full" />
            <Skeleton className="h-16 w-4/5" />
            <Skeleton className="h-8 w-1/2" />
            <LineSet lines={3} />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]">
            <Skeleton className="aspect-[4/5] w-full rounded-[3rem]" />
          </div>
        </div>

        <div className="grid gap-6">
          <div className="mx-auto grid max-w-2xl gap-4 text-center">
            <Skeleton className="mx-auto h-4 w-28" />
            <Skeleton className="mx-auto h-12 w-80" />
            <Skeleton className="mx-auto h-4 w-full" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SectionCard key={index} className="p-6">
                <Skeleton className="h-16 w-16 rounded-[1.5rem]" />
                <Skeleton className="mt-5 h-5 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </SectionCard>
            ))}
          </div>
        </div>

        <div className="grid gap-14 lg:grid-cols-[0.95fr_minmax(0,1.05fr)]">
          <div className="grid gap-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-14 w-4/5" />
            <LineSet lines={4} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-[420px] w-full rounded-[2.6rem]" />
            <div className="grid gap-5">
              <Skeleton className="h-[200px] w-full rounded-[2.6rem]" />
              <Skeleton className="h-[200px] w-full rounded-[2.6rem]" />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="mx-auto grid max-w-2xl gap-4 text-center">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-12 w-80" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SectionCard key={index} className="p-8">
                <Skeleton className="h-16 w-16 rounded-[1.6rem]" />
                <Skeleton className="mt-6 h-7 w-3/4" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-6 h-11 w-36 rounded-full" />
              </SectionCard>
            ))}
          </div>
        </div>

        <SectionCard className="rounded-[3.6rem] px-8 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto grid max-w-3xl justify-items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <LineSet lines={2} />
            <Skeleton className="h-12 w-44 rounded-full" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function renderVariant(variant: LoadingVariant) {
  switch (variant) {
    case "home":
      return <HomeSkeleton />;
    case "admin-shell":
      return <AdminShellSkeleton />;
    case "dashboard":
      return <DashboardSkeleton />;
    case "form":
      return <FormSkeleton />;
    case "split-form":
      return <SplitFormSkeleton />;
    case "media":
      return <MediaSkeleton />;
    case "auth":
      return <AuthSkeleton />;
    default:
      return <DefaultSkeleton />;
  }
}

export function LoadingBlock({
  label = "Loading...",
  variant = "default"
}: {
  label?: string;
  variant?: LoadingVariant;
}) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {renderVariant(variant)}
    </div>
  );
}
