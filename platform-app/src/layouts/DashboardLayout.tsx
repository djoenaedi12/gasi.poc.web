import { Outlet } from "react-router";

import { AppHeader } from "@gasi/core-ui";
import { AppSidebar } from "@gasi/core-ui";
import {
    SidebarInset,
    SidebarProvider,
} from "@gasi/core-ui";

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
