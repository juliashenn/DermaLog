"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Calendar, Home, BookOpen, Search, Settings, FilePlus, Inbox, Sparkles, SoapDispenserDroplet, ChartLine} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const items = [
  { title: "Dashboard", url: "#", icon: Home },
  { title: "New Entry", url: "#", icon: FilePlus },
  { title: "My Routine", url: "#", icon: SoapDispenserDroplet },
  { title: "Recommendations", url: "#", icon: ChartLine },
  { title: "Handbook", url: "#", icon: BookOpen },
  { title: "Settings", url: "#", icon: Settings},
];

export function AppSidebar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col h-full">
        {/* Top Nav */}
        <SidebarGroup>
          <SidebarGroupLabel>DermaLog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pushes user info to bottom */}
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.image ?? ""} />
              <AvatarFallback>
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name ?? "User"}</span>
              <span className="text-xs text-muted-foreground">
                {user?.email ?? "No email"}
              </span>
            </div>
          </div>
          <Separator className="my-3" />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logout
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
