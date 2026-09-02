import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { SellerSidebar } from "./SellerSidebar";
import { SellerMobileNav } from "./SellerMobileNav";
import { SmartEdgeSidebar } from "../smart-sidebar/SmartEdgeSidebar";
import { AndroidRecentAppsSwitcher } from "../mobile-multitab/AndroidRecentAppsSwitcher";

interface AppLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  noPad?: boolean;
  hideNav?: boolean;
  variant?: "buyer" | "seller";
  activeTab?: string;
  onTabChange?: (tab: any) => void;
}

export function AppLayout({
  children,
  rightPanel,
  noPad,
  hideNav,
  variant = "buyer",
  activeTab,
  onTabChange,
}: AppLayoutProps) {
  const isSeller = variant === "seller";
  const isInsideIframe = typeof window !== "undefined" && window.self !== window.top;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {isSeller ? (
        <SellerSidebar activeTab={activeTab} onTabChange={onTabChange} />
      ) : (
        <Sidebar />
      )}

      <div className="lg:ml-64 min-h-screen">
        <div className={`w-full max-w-[1536px] mx-auto flex gap-0 ${noPad ? "" : "px-3 sm:px-5 lg:px-6 pt-0 pb-6 sm:pb-8 lg:pb-8"}`}>
          <main className={`flex-1 min-w-0 ${hideNav ? "pb-0" : "pb-20 lg:pb-0"}`}>
            {children}
          </main>
          {rightPanel && (
            <aside className="hidden xl:block w-80 flex-shrink-0 pl-5 space-y-4 sticky top-0 h-screen overflow-y-auto pt-4">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>

      {!hideNav && (
        isSeller ? (
          <SellerMobileNav activeTab={activeTab} onTabChange={onTabChange} />
        ) : (
          <MobileNav />
        )
      )}

      {/* Android Recent Apps Deck Switcher (Mobile-Only, outside iframe) */}
      {!isInsideIframe && <AndroidRecentAppsSwitcher />}

      {/* Floating Smart Edge Sidebar & Freeform Window */}
      {!isInsideIframe && <SmartEdgeSidebar />}
    </div>
  );
}
