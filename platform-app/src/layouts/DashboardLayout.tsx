import { Outlet } from "react-router";

import { AppHeader } from "@/components/organisms/app-header";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

export function DashboardLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <AppHeader />

                <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
