import { AppSidebar } from "@/components/layout/sidebar.layout";
import { SiteHeader } from "@/components/layout/site.header.layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

interface DefaultLayoutProps {
  children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="w-full p-4 md:p-8 pt-14 md:pt-20">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
