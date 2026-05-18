import { ArrowUpRight, CalendarCheck, Clock3, UsersRound } from "lucide-react";

import { PageHeader } from "@/components/molecules/page-header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const summaryItems = [
    {
        title: "Total Employees",
        value: "248",
        description: "Active employees this month",
        icon: UsersRound,
    },
    {
        title: "Attendance",
        value: "94%",
        description: "Average daily attendance",
        icon: CalendarCheck,
    },
    {
        title: "Pending Requests",
        value: "18",
        description: "Leave and approval queue",
        icon: Clock3,
    },
    {
        title: "Payroll Status",
        value: "Ready",
        description: "Next payroll cycle prepared",
        icon: ArrowUpRight,
    },
];

export function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Dashboard"
                description="Ringkasan aktivitas HR, kehadiran, dan status operasional karyawan."
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryItems.map((item) => (
                    <Card key={item.title} size="sm">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardDescription>{item.title}</CardDescription>
                                    <CardTitle className="mt-2 text-2xl font-semibold">
                                        {item.value}
                                    </CardTitle>
                                </div>

                                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                                    <item.icon className="size-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {item.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}
