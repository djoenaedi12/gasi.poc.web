import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { ConfirmDialog } from "../molecules/ConfirmDialog";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type DataTableRowActionsOptions<TData> = {
    basePath: string;
    entityName: string;
    getRowId: (row: TData) => string;
    onDelete?: (id: string, row: TData) => void | Promise<void>;
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    viewLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
    deleteTitle?: string;
    deleteDescription?: string;
};

export function DataTableRowActions<TData>({
    row,
    basePath,
    entityName,
    getRowId,
    onDelete,
    showView = true,
    showEdit = true,
    showDelete = true,
    viewLabel = "View detail",
    editLabel = "Edit",
    deleteLabel = "Delete",
    deleteTitle,
    deleteDescription = "This action cannot be undone.",
}: DataTableRowActionsOptions<TData> & {
    row: TData;
}) {
    const id = getRowId(row);

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" />}>
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open row actions</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={6} className="w-40">
                    <DropdownMenuGroup>
                        {showView ? (
                            <DropdownMenuItem render={<Link to={`${basePath}/${id}`} />}>
                                <Eye className="size-4" />
                                {viewLabel}
                            </DropdownMenuItem>
                        ) : null}

                        {showEdit ? (
                            <DropdownMenuItem render={<Link to={`${basePath}/${id}/edit`} />}>
                                <Edit className="size-4" />
                                {editLabel}
                            </DropdownMenuItem>
                        ) : null}

                        {showDelete ? (
                            <ConfirmDialog
                                destructive
                                title={deleteTitle ?? `Delete ${entityName}?`}
                                description={deleteDescription}
                                confirmLabel={deleteLabel}
                                trigger={
                                    <DropdownMenuItem variant="destructive" disabled={!onDelete}>
                                        <Trash2 className="size-4" />
                                        {deleteLabel}
                                    </DropdownMenuItem>
                                }
                                onConfirm={() => onDelete?.(id, row)}
                            />
                        ) : null}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function getDataTableRowActionsColumn<TData>(
    options: DataTableRowActionsOptions<TData>,
): ColumnDef<TData> {
    return {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <DataTableRowActions row={row.original} {...options} />
        ),
        enableSorting: false,
        enableHiding: false,
    };
}
