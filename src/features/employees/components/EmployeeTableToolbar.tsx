import { X } from "lucide-react";

import { LookupPicker } from "@/components/molecules/lookup-picker";
import { Button } from "@/components/ui/button";

type EmployeeTableToolbarProps = {
    department: string;
    status: string;
    departments: string[];
    statuses: string[];
    onDepartmentChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onReset: () => void;
};

export function EmployeeTableToolbar({
    department,
    status,
    departments,
    statuses,
    onDepartmentChange,
    onStatusChange,
    onReset,
}: EmployeeTableToolbarProps) {
    const hasActiveFilter = department !== "all" || status !== "all";
    const departmentOptions = departments.map((item) => ({
        label: item,
        value: item,
        description: "Department",
    }));

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <LookupPicker
                value={department === "all" ? undefined : department}
                options={departmentOptions}
                title="Select Department"
                placeholder="All departments"
                searchPlaceholder="Search department..."
                onChange={onDepartmentChange}
                onClear={() => onDepartmentChange("all")}
            />

            <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
                <option value="all">All statuses</option>
                {statuses.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>

            {hasActiveFilter ? (
                <Button type="button" variant="ghost" size="sm" onClick={onReset}>
                    <X className="size-4" />
                    Reset
                </Button>
            ) : null}
        </div>
    );
}
