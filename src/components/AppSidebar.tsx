import { useState } from "react";
import { Home, Plus, Calendar, Building2, Gift, Bell, ClockIcon, Zap, Users, LogOut, Settings as SettingsIcon, FileText, CheckSquare, KeyRound, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AddFacilityDialog } from "@/components/AddFacilityDialog";
import { PushNotificationDialog } from "@/components/PushNotificationDialog";
import { QuickBookingDialog } from "@/components/QuickBookingDialog";
import { toast } from "sonner";
import washapLogo from "@/assets/washap-logo.png";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, end: true, roles: ["admin", "chef", "arbetare"] },
  { title: "Skapa bokning", url: "/book", icon: Plus, roles: ["admin", "chef", "arbetare"] },
  { title: "Hantera bokningar", url: "/bookings", icon: Calendar, roles: ["admin", "chef", "arbetare"] },
  { title: "Hantera anläggningar", url: "/facilities", icon: Building2, roles: ["admin", "chef", "arbetare"] },
  { title: "Schemalagda notiser", url: "/scheduled-notifications", icon: ClockIcon, roles: ["admin", "chef", "arbetare"] },
  { title: "Erbjudanden", url: "/offers", icon: Gift, roles: ["admin", "chef", "arbetare"] },
  { title: "Att göra", url: "/todos", icon: CheckSquare, roles: ["admin", "arbetare"] },
  { title: "Användarhantering", url: "/users", icon: Users, roles: ["admin", "chef", "arbetare"] },
  { title: "Kunder", url: "/customers", icon: Users, roles: ["admin", "chef", "arbetare"] },
  { title: "Sideditor", url: "/landing-cms", icon: FileText, roles: ["admin"] },
  { title: "Partner-API", url: "/partners", icon: KeyRound, roles: ["admin"] },
  { title: "SEO-dashboard", url: "/seo", icon: BarChart3, roles: ["admin"] },
  { title: "Inställningar", url: "/settings", icon: SettingsIcon, roles: ["admin", "chef", "arbetare"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile, roles, signOut, isArbetare, isAdmin, isChef } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPushDialogOpen, setIsPushDialogOpen] = useState(false);
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const isCollapsed = state === "collapsed";

  const hasAccess = (itemRoles: string[]) => {
    return roles.some((role) => itemRoles.includes(role.role));
  };

  const filteredNavigationItems = navigationItems.filter((item) => hasAccess(item.roles));

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarContent>
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border" style={{ backgroundColor: "#2e8b57" }}>
            <div className="flex items-center gap-2">
              {!isCollapsed && <img src={washapLogo} alt="WASH'AP" className="h-8 w-auto" />}
            </div>
          </div>

          {/* User Info */}
          {profile && (
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  {!isCollapsed && (
                    <>
                      <p className="text-sm font-medium truncate">{profile.display_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.username}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNavigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} end={item.end} className="flex items-center gap-2 w-full">
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Quick Actions */}
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>Snabbåtgärder</SidebarGroupLabel>}
            <SidebarGroupContent>
              <div className="space-y-2 p-2">
                <Button
                  onClick={() => setIsQuickBookingOpen(true)}
                  variant="outline"
                  size={isCollapsed ? "icon" : "default"}
                  className="w-full justify-start"
                  title="Snabbregistrering Drop-in"
                >
                  <Zap className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">Snabbregistrering</span>}
                </Button>
                {(isAdmin || isChef || isArbetare) && (
                  <>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      variant="outline"
                      size={isCollapsed ? "icon" : "default"}
                      className="w-full justify-start"
                      title="Lägg till anläggning"
                    >
                      <Building2 className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">Lägg till anläggning</span>}
                    </Button>
                    <Button
                      onClick={() => setIsPushDialogOpen(true)}
                      variant="outline"
                      size={isCollapsed ? "icon" : "default"}
                      className="w-full justify-start"
                      title="Skicka push-notis"
                    >
                      <Bell className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">Skicka push-notis</span>}
                    </Button>
                  </>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <QuickBookingDialog open={isQuickBookingOpen} onOpenChange={setIsQuickBookingOpen} />

      <AddFacilityDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          // Successfully added facility
          toast.success("Anläggningen har lagts till!");
        }}
      />

      <PushNotificationDialog open={isPushDialogOpen} onOpenChange={setIsPushDialogOpen} />
    </>
  );
}
