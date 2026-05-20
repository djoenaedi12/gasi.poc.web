import { PageHeader } from "@gasi/core-ui";

export function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Dashboard"
                description="Ringkasan aktivitas HR, kehadiran, dan status operasional karyawan."
            />
        </div>
    );
}
