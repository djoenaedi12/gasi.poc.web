import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";

import { cn } from "../../lib/utils";

const routeLabels: Record<string, string> = {
    employees: "Employees",
    departments: "Departments",
    roles: "Roles",
    attendance: "Attendance",
    payroll: "Payroll",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
    appearance: "Appearance Setting",
    create: "Create",
    edit: "Edit",
};

type PageHeaderProps = {
    title: string;
    description?: string;
    className?: string;
    breadcrumbs?: BreadcrumbItem[];
    breadcrumbLabels?: Record<string, string | undefined>;
    actions?: ReactNode;
};

type BreadcrumbItem = {
    label: string;
    href?: string;
};

function formatSegment(segment: string) {
    return (
        routeLabels[segment] ??
        segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    );
}

export function PageHeader({
    title,
    description,
    className,
    breadcrumbs,
    breadcrumbLabels,
    actions,
}: PageHeaderProps) {
    const location = useLocation();
    const segments = location.pathname.split("/").filter(Boolean);
    const breadcrumbItems = breadcrumbs ?? segments.map((segment, index) => ({
        label: breadcrumbLabels?.[segment] ?? formatSegment(segment),
        href: `/${segments.slice(0, index + 1).join("/")}`,
    }));

    return (
        <section
            className={cn(
                "flex flex-col gap-4 bg-background",
                className,
            )}
        >
            <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1 text-sm text-muted-foreground"
            >
                <Link
                    to="/"
                    className="inline-flex items-center gap-1 rounded-md transition hover:text-primary hover:underline"
                >
                    <Home className="size-4" />
                    <span>Dashboard</span>
                </Link>

                {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1;
                    const key = item.href ?? `${item.label}-${index}`;

                    return (
                        <div key={key} className="flex items-center gap-1">
                            <ChevronRight className="size-4" />
                            {isLast || !item.href ? (
                                <span className="font-medium text-foreground">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.href}
                                    className="rounded-md transition hover:text-primary hover:underline"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-normal text-foreground">
                        {title}
                    </h1>
                    {description ? (
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>

                {actions ? (
                    <div className="flex shrink-0 items-center gap-2">
                        {actions}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
