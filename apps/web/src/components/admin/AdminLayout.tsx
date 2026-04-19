import { useMemo, useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  User,
  UserCircle,
  Home,
  Briefcase,
  Image as ImageIcon,
  Layout,
  Settings,
  Bell,
  HelpCircle,
  Search,
  LogOut
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { LoadingBlock } from "../ui/LoadingBlock";

const navItems = [
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/contacts", label: "Contact Methods", icon: UserCircle },
  { to: "/admin/homestay", label: "Homestay", icon: Home },
  { to: "/admin/services", label: "Services", icon: Briefcase },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
  { to: "/admin/closing", label: "Closing Section", icon: Layout },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const sharedNav = useMemo(
    () => (
      <nav className="flex flex-col gap-1.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-on-surface/40 hover:bg-on-surface/5 hover:text-on-surface"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'bg-transparent text-on-surface/30 group-hover:text-on-surface'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(124,59,237,0.5)]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    ),
    []
  );

  if (loading) {
    return <LoadingBlock label="Checking your admin session..." variant="admin-shell" />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ── Desktop Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 hidden w-[280px] flex-col border-r border-outline-variant/50 bg-white lg:flex">
        <div className="flex px-7 py-8">
          <NavLink to="/" className="font-display text-lg font-bold tracking-tight text-primary uppercase">
            Nguyen Thanh Hoang
          </NavLink>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sharedNav}
        </div>

        <div className="border-t border-outline-variant/30 p-4">
          <div className="flex items-center gap-3 rounded-[1.4rem] bg-surface-container p-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
               {user?.email?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-on-surface">
                {user?.email?.split('@')[0] ?? "Admin"}
              </p>
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-on-surface/40">
                {user?.role ?? "Chief Curator"}
              </p>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-on-surface/40 transition hover:bg-tertiary/10 hover:text-tertiary"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 lg:pl-[280px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-surface/80 px-6 backdrop-blur-md lg:px-10">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              type="button"
              className="rounded-full p-2 text-on-surface lg:hidden"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="hidden font-display text-lg font-bold text-on-surface lg:block">
              Nguyen Thanh Hoang | Admin
            </h1>

            {/* Global Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface/30" />
              <input 
                type="text" 
                placeholder="Search portfolio..." 
                className="h-11 w-64 rounded-xl bg-on-surface/5 pl-11 pr-4 text-sm outline-none transition-all focus:w-80 focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-on-surface/5">
              <Bell className="h-5 w-5 text-on-surface/70" />
              <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-on-surface/5">
              <HelpCircle className="h-5 w-5 text-on-surface/70" />
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/50 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl border-2 border-white shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Alex+Rivera&background=7c3bed&color=fff" alt="User" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-6 pb-20 pt-4 lg:px-10">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-6 border-b border-outline-variant/10">
              <span className="font-display text-base font-bold text-primary uppercase">Nguyen Thanh Hoang</span>
              <button
                type="button"
                className="rounded-full p-2 text-on-surface"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sharedNav}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
