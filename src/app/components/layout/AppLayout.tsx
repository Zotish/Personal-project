import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { SellerSidebar } from "./SellerSidebar";
import { SellerMobileNav } from "./SellerMobileNav";

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

  return (
    <div className="min-h-screen bg-background">
      {isSeller ? (
        <SellerSidebar activeTab={activeTab} onTabChange={onTabChange} />
      ) : (
        <Sidebar />
      )}

      <div className="lg:ml-64">
        <div className="max-w-6xl mx-auto flex gap-0">
          <main className={`flex-1 min-w-0 ${noPad ? "" : ""} ${hideNav ? "pb-0" : "pb-20 lg:pb-0"}`}>
            {children}
          </main>
          {rightPanel && (
            <aside className="hidden xl:block w-80 flex-shrink-0 p-4 space-y-4 sticky top-0 h-screen overflow-y-auto">
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
    </div>
  );
}
