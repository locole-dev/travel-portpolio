import { ShieldCheck, LogOut, Terminal, Globe, Lock } from "lucide-react";

import { API_BASE_URL, MOCK_API_ENABLED } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
       {/* Header Area */}
       <div className="mb-10 text-center md:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
          SYSTEM PREFERENCES
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-black tracking-tight text-on-surface">
          Settings & Identity
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface/50">
          Monitor your active session, environment variables, and security configuration. 
          Keep your credentials secure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
         {/* Account Card */}
         <Card className="p-8 border-none shadow-card bg-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5">
               <ShieldCheck className="h-40 w-40" />
            </div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-black text-on-surface">Current Admin</h3>
               </div>

               <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-surface-container/30 border border-outline-variant/30">
                     <p className="text-[10px] font-black uppercase tracking-wider text-on-surface/30 mb-2">EMAIL ADDRESS</p>
                     <p className="text-sm font-bold text-on-surface">{user?.email ?? "Not available"}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-surface-container/30 border border-outline-variant/30">
                     <p className="text-[10px] font-black uppercase tracking-wider text-on-surface/30 mb-2">ACCESS LEVEL</p>
                     <p className="text-sm font-bold text-on-surface capitalize">{user?.role ?? "Standard User"}</p>
                  </div>
               </div>

               <Button className="mt-8 w-full !h-14 !rounded-2xl" variant="danger" onClick={() => void logout()}>
                  <LogOut className="h-5 w-5 mr-3" />
                  Terminate Session
               </Button>
            </div>
         </Card>

         {/* Environment Card */}
         <Card className="p-8 border-none shadow-card bg-[#1A1A1A] text-white">
            <div className="flex items-center gap-4 mb-8 text-primary">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                 <Terminal className="h-6 w-6" />
               </div>
               <h3 className="font-display text-xl font-black text-white">Environment</h3>
            </div>

            <div className="space-y-4">
               <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                     <Globe className="h-3 w-3 text-white/30" />
                     <p className="text-[10px] font-black uppercase tracking-wider text-white/30">API TARGET</p>
                  </div>
                  <p className="text-xs font-mono text-primary truncate">{API_BASE_URL}</p>
               </div>
               <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                     <Terminal className="h-3 w-3 text-white/30" />
                     <p className="text-[10px] font-black uppercase tracking-wider text-white/30">SOURCE MODE</p>
                  </div>
                  <p className="text-xs font-bold text-white">
                     {MOCK_API_ENABLED ? "Simulated (Mock API)" : "Production (Live Backend)"}
                  </p>
               </div>
               <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                     <Lock className="h-3 w-3" />
                     <p className="text-[10px] font-black uppercase tracking-wider">SECURITY STATUS</p>
                  </div>
                  <p className="text-xs font-medium text-white/70 leading-relaxed">
                     Secure cookies and CSRF protection are active for your current connection.
                  </p>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}

