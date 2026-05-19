import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { Button } from "@/components/ui/button";

type DataTableBulkDeleteActionProps<TData> = {
    selectedRows: TData[];
    entityName: string;
    getRowId: (row: TData) => string;
    onDelete: (ids: string[]) => void;
};

export function DataTableBulkDeleteAction<TData>({
    selectedRows,
    entityName,
    getRowId,
    onDelete,
}: DataTableBulkDeleteActionProps<TData>) {
    return (
        <ConfirmDialog
            destructive
            title={`Delete selected ${entityName}?`}
            description={`You are about to delete ${selectedRows.length} ${entityName}. This action cannot be undone.`}
            confirmLabel="Delete"
            trigger={
                <Button type="button" variant="destructive" size="sm">
                    <Trash2 className="size-4" />
                    Delete selected
                </Button>
            }
            onConfirm={() => onDelete(selectedRows.map((row) => getRowId(row)))}
        />
    );
}
