import type { Table } from "@tanstack/react-table";

import {
    getColumnLabel,
    type DataTableColumn,
} from "./dataTableUtils";

function getExportValue(value: unknown) {
    if (value === null || value === undefined) {
        return "";
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
}

function escapeCsvValue(value: unknown) {
    const text = getExportValue(value);
    const escaped = text.replace(/"/g, '""');

    return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function downloadCsv(fileName: string, rows: unknown[][]) {
    const csv = rows
        .map((row) => row.map(escapeCsvValue).join(","))
        .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportVisibleTableRowsToCsv<TData>(
    table: Table<TData>,
    fileName: string,
) {
    const exportColumns = table
        .getVisibleLeafColumns()
        .filter((column) => !["select", "actions"].includes(column.id));
    const exportRows = table.getRowModel().rows;

    downloadCsv(fileName, [
        exportColumns.map((column) =>
            getColumnLabel(column as DataTableColumn),
        ),
        ...exportRows.map((row) =>
            exportColumns.map((column) => row.getValue(column.id)),
        ),
    ]);
}
