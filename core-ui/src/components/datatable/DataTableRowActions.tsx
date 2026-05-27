import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
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
    backTo?: string;
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    viewLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
    deleteTitle?: string;
    deleteDescription?: string;
    presentation?: "menu" | "inline";
};

export function DataTableRowActions<TData>({
    row,
    basePath,
    entityName,
    getRowId,
    onDelete,
    backTo,
    showView = true,
    showEdit = true,
    showDelete = true,
    viewLabel = "View detail",
    editLabel = "Edit",
    deleteLabel = "Delete",
    deleteTitle,
    deleteDescription = "This action cannot be undone.",
    presentation = "menu",
}: DataTableRowActionsOptions<TData> & {
    row: TData;
}) {
    const id = getRowId(row);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const backToQuery = optionsBackTo(backTo);
    const viewPath = `${basePath}/${id}${backToQuery}`;
    const editPath = `${basePath}/${id}/edit${backToQuery}`;
    const deleteDialog = showDelete ? (
        <ConfirmDialog
            destructive
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title={deleteTitle ?? `Delete ${entityName}?`}
            description={deleteDescription}
            confirmLabel={deleteLabel}
            onConfirm={() => onDelete?.(id, row)}
        />
    ) : null;

    if (presentation === "inline") {
        return (
            <>
                <div className="flex items-center justify-end gap-1.5">
                    {showView ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            render={<Link to={viewPath} />}
                            aria-label={viewLabel}
                            title={viewLabel}
                        >
                            <Eye className="size-4" />
                        </Button>
                    ) : null}

                    {showEdit ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            render={<Link to={editPath} />}
                            aria-label={editLabel}
                            title={editLabel}
                        >
                            <Edit className="size-4" />
                        </Button>
                    ) : null}

                    {showDelete ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        aria-label="More actions"
                                        title="More actions"
                                    />
                                }
                            >
                                <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" sideOffset={6} className="w-40">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        disabled={!onDelete}
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        <Trash2 className="size-4" />
                                        {deleteLabel}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>
                {deleteDialog}
            </>
        );
    }

    return (
        <>
            <div className="flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" />}>
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open row actions</span>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" sideOffset={6} className="w-40">
                        <DropdownMenuGroup>
                            {showView ? (
                                <DropdownMenuItem render={<Link to={viewPath} />}>
                                    <Eye className="size-4" />
                                    {viewLabel}
                                </DropdownMenuItem>
                            ) : null}

                            {showEdit ? (
                                <DropdownMenuItem render={<Link to={editPath} />}>
                                    <Edit className="size-4" />
                                    {editLabel}
                                </DropdownMenuItem>
                            ) : null}

                            {showDelete ? (
                                <DropdownMenuItem
                                    variant="destructive"
                                    disabled={!onDelete}
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="size-4" />
                                    {deleteLabel}
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {deleteDialog}
        </>
    );
}

function optionsBackTo(backTo?: string) {
    return backTo ? `?backTo=${encodeURIComponent(backTo)}` : "";
}

export function getDataTableRowActionsColumn<TData>(
    options: DataTableRowActionsOptions<TData>,
): ColumnDef<TData> {
    return {
        id: "actions",
        header: options.presentation === "inline" ? "Actions" : () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <DataTableRowActions row={row.original} {...options} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
            className: "text-right",
        },
    };
}
