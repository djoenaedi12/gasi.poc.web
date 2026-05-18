import type { Column, ColumnDef } from "@tanstack/react-table";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Edit,
    Eye,
    MoreHorizontal,
    Trash2,
} from "lucide-react";
import { Link } from "react-router";

import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Employee } from "../types/employee.types";

type EmployeeColumnsOptions = {
    onDelete: (id: string) => void;
};

function sortableHeader<TData, TValue>(
    column: Column<TData, TValue>,
    label: string,
) {
    const sorted = column.getIsSorted();
    const Icon =
        sorted === "asc"
            ? ChevronUp
            : sorted === "desc"
              ? ChevronDown
              : ChevronsUpDown;

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-3 gap-1.5 px-2"
            onClick={() => column.toggleSorting(sorted === "asc")}
        >
            {label}
            <Icon className="size-4 text-muted-foreground" />
        </Button>
    );
}

function EmployeeRowActions({ employee, onDelete }: EmployeeColumnsOptions & {
    employee: Employee;
}) {
    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button type="button" variant="ghost" size="icon-sm" />
                    }
                >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open row actions</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={6} className="w-40">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            render={<Link to={`/employees/${employee.id}`} />}
                        >
                            <Eye className="size-4" />
                            View detail
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            render={<Link to={`/employees/${employee.id}/edit`} />}
                        >
                            <Edit className="size-4" />
                            Edit
                        </DropdownMenuItem>

                        <ConfirmDialog
                            destructive
                            title="Delete employee?"
                            description={`You are about to delete ${employee.name}. This action cannot be undone.`}
                            confirmLabel="Delete"
                            trigger={
                                <DropdownMenuItem variant="destructive">
                                    <Trash2 className="size-4" />
                                    Delete
                                </DropdownMenuItem>
                            }
                            onConfirm={() => onDelete(employee.id)}
                        />
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function getEmployeeColumns({
    onDelete,
}: EmployeeColumnsOptions): ColumnDef<Employee>[] {
    return [
        {
            accessorKey: "name",
            header: ({ column }) => sortableHeader(column, "Name"),
            meta: { label: "Name" },
        },
        {
            accessorKey: "department",
            header: ({ column }) => sortableHeader(column, "Department"),
            meta: { label: "Department" },
        },
        {
            accessorKey: "position",
            header: ({ column }) => sortableHeader(column, "Position"),
            meta: { label: "Position" },
        },
        {
            accessorKey: "status",
            header: ({ column }) => sortableHeader(column, "Status"),
            cell: ({ row }) => {
                const status = row.original.status;
                const variant = status === "Inactive" ? "outline" : "secondary";

                return <Badge variant={variant}>{status}</Badge>;
            },
            meta: { label: "Status" },
        },
        {
            accessorKey: "joinDate",
            header: ({ column }) => sortableHeader(column, "Join date"),
            meta: { label: "Join date" },
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
                <EmployeeRowActions employee={row.original} onDelete={onDelete} />
            ),
            enableSorting: false,
            enableHiding: false,
            meta: {
                label: "Actions",
                className: "w-12 min-w-12 max-w-12 px-0",
            },
        },
    ];
}
