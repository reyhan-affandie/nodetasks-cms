import { AppSidebar } from "@/components/layout/sidebar.layout";
import { SiteHeader } from "@/components/layout/site.header.layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

interface DefaultLayoutProps {
  children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="h-screen overflow-hidden [--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col h-full">
        <SiteHeader />
        <div className="flex flex-1 h-full">
          <AppSidebar />
          <SidebarInset className="w-full p-4 md:p-8 pt-14 md:pt-20 overflow-hidden">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
