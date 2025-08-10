import { requireAuth } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "../providers";

import { ModeToggle } from "@/components/modeButton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth(); // blocks if not logged in

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <SidebarProvider>
                <AppSidebar />
                <main>
                  <SidebarTrigger />
                  {children}
                </main>
              </SidebarProvider>

            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}