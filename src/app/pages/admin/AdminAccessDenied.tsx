import React from "react";
import { useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { useAdminRole, ROLE_CONFIGS } from "../../context/AdminRoleContext";

export function AdminAccessDenied({ requiredPermission }: { requiredPermission?: string }) {
  const navigate = useNavigate();
  const { activeRole, switchRole, availableRoles } = useAdminRole();
  const currentConfig = ROLE_CONFIGS[activeRole];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center text-slate-900 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto mb-5 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-widest font-bold uppercase bg-red-50 text-red-700 border border-red-200 inline-block mb-3">
          403 • ACCESS DENIED
        </span>

        <h2 className="text-xl font-black tracking-tight mb-2 text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
          Permission Required
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Your current role (<strong className="text-slate-900">{currentConfig.title}</strong>) does not have authorization
          to view this module{requiredPermission ? ` (Required: ${requiredPermission})` : ""}.
        </p>

        {/* Role Simulator Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left mb-6">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-700">
            <RefreshCw className="w-3.5 h-3.5" /> Testing & Role Simulation
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Want to test this page? Switch to <strong>Super Admin</strong> or an authorized role:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => switchRole("super_admin")}
              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
            </button>
            <button
              onClick={() => navigate(currentConfig.defaultPath)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> My Workspace
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin")}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition"
        >
          Return to Admin Dashboard
        </button>
      </div>
    </div>
  );
}
