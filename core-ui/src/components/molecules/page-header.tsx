import { ChevronRight, Home } from "lucide-react";
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
}: PageHeaderProps) {
    const location = useLocation();
    const segments = location.pathname.split("/").filter(Boolean);

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

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join("/")}`;
                    const isLast = index === segments.length - 1;

                    return (
                        <div key={href} className="flex items-center gap-1">
                            <ChevronRight className="size-4" />
                            {isLast ? (
                                <span className="font-medium text-foreground">
                                    {formatSegment(segment)}
                                </span>
                            ) : (
                                <Link
                                    to={href}
                                    className="rounded-md transition hover:text-primary hover:underline"
                                >
                                    {formatSegment(segment)}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>

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
        </section>
    );
}
