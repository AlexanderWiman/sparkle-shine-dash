import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <MaintenanceBanner />
          {/* Global trigger that is ALWAYS visible */}
          <header className="h-14 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 px-2 sm:px-4 shrink-0">
            <SidebarTrigger className="shrink-0" />
            {profile && (
              <div className="flex items-center gap-1 sm:gap-4 min-w-0">
                <div className="text-sm hidden sm:block truncate">
                  <span className="font-medium">{profile.display_name}</span>
                  <span className="text-muted-foreground ml-2">({profile.username})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  title="Logga ut"
                  className="px-2 sm:px-4 shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Logga ut</span>
                </Button>
              </div>
            )}
          </header>
          <div className="flex-1 min-w-0">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
