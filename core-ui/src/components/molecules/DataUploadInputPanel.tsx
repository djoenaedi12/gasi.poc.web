import {
    Database,
    Download,
    FileUp,
    FolderOpen,
    Search,
    Settings2,
    Trash2,
    Upload,
} from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

import { useI18n } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import type { GenericFilter, PageResult, SearchRequest } from "../../types/api.types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { FormFieldLabel } from "./FormFieldLabel";
import { LookupPicker, type LookupOption } from "./LookupPicker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

export type DataUploadSource = "FILE" | "THIRD_PARTY_API";

type DataUploadMapperOption = {
    value: string;
    label: string;
    source?: DataUploadSource | "BOTH";
};

type DataUploadInputPanelProps = {
    file: File | null;
    onFileChange: (file: File | null) => void;
    onDownloadTemplate: () => void | Promise<void>;
    onUpload: () => void | Promise<void>;
    source?: DataUploadSource;
    onSourceChange?: (source: DataUploadSource) => void;
    mapperId?: string;
    onMapperChange?: (mapperId: string) => void;
    mapperOptions?: DataUploadMapperOption[];
    deleteExisting?: boolean;
    onDeleteExistingChange?: (checked: boolean) => void;
    existingInstructionNo?: string;
    onExistingInstructionNoChange?: (instructionNo: string) => void;
    existingInstructionOptions?: LookupOption[];
    existingInstructionSelectedOptions?: LookupOption[];
    existingInstructionPageQuery?: (
        request: SearchRequest,
    ) => UseQueryResult<PageResult<LookupOption> | undefined, unknown>;
    existingInstructionSearchFields?: string[];
    existingInstructionBuildFilter?: (search: string) => GenericFilter | undefined;
    accept?: string;
    disabled?: boolean;
    isDownloadingTemplate?: boolean;
    isUploading?: boolean;
    title?: string;
    description?: string;
    dropTitle?: string;
    dropDescription?: string;
    fileHint?: string;
    emptyFileLabel?: string;
    downloadLabel?: string;
    uploadLabel?: string;
    fetchLabel?: string;
};

export function DataUploadInputPanel({
    file,
    onFileChange,
    onDownloadTemplate,
    onUpload,
    source = "FILE",
    onSourceChange,
    mapperId = "",
    onMapperChange,
    mapperOptions,
    deleteExisting = false,
    onDeleteExistingChange,
    existingInstructionNo = "",
    onExistingInstructionNoChange,
    existingInstructionOptions,
    existingInstructionSelectedOptions,
    existingInstructionPageQuery,
    existingInstructionSearchFields,
    existingInstructionBuildFilter,
    accept = ".csv,.xlsx,.xls",
    disabled,
    isDownloadingTemplate,
    isUploading,
    title,
    description,
    dropTitle,
    dropDescription,
    fileHint,
    emptyFileLabel,
    downloadLabel,
    uploadLabel,
    fetchLabel,
}: DataUploadInputPanelProps) {
    const { t } = useI18n();
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const isBusy = disabled || isUploading || isDownloadingTemplate;
    const resolvedMapperOptions = mapperOptions ?? [
        { value: "default-file-mapper", label: t("dataUpload.input.mapper.fileExample"), source: "FILE" },
        { value: "third-party-api-mapper", label: t("dataUpload.input.mapper.apiExample"), source: "THIRD_PARTY_API" },
    ];
    const resolvedInstructionOptions = existingInstructionOptions ?? [
        {
            value: "INS-2026-0001",
            label: "INS-2026-0001",
            description: t("dataUpload.input.instructionNo.exampleDescription"),
        },
        {
            value: "INS-2026-0002",
            label: "INS-2026-0002",
            description: t("dataUpload.input.instructionNo.exampleDescription"),
        },
    ];
    const selectedInstructionOptions = existingInstructionSelectedOptions
        ?? resolvedInstructionOptions.filter((option) => option.value === existingInstructionNo)
        ?? [];
    const visibleMapperOptions = resolvedMapperOptions.filter((option) => !option.source || option.source === "BOTH" || option.source === source);
    const isApiSource = source === "THIRD_PARTY_API";
    const canSubmit = isApiSource ? Boolean(mapperId) && !isBusy : Boolean(file) && !isBusy;

    const handleFiles = (files: FileList | null) => {
        onFileChange(files?.[0] ?? null);
    };

    return (
        <div className="grid overflow-hidden rounded-xl border border-border bg-card shadow-xs lg:grid-cols-[minmax(20rem,0.42fr)_minmax(0,1fr)]">
            <section className="space-y-6 p-5 md:p-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">{title ?? t("dataUpload.input.setupTitle")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{description ?? t("dataUpload.input.description")}</p>
                </div>

                <div className="space-y-5">
                    <FieldBlock
                        label={t("dataUpload.input.sourceLabel")}
                        tooltip={t("dataUpload.input.sourceDescription")}
                    >
                        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                            <SourceButton
                                active={source === "FILE"}
                                icon={<FileUp className="size-4" />}
                                label={t("dataUpload.source.file")}
                                disabled={isBusy}
                                onClick={() => onSourceChange?.("FILE")}
                            />
                            <SourceButton
                                active={source === "THIRD_PARTY_API"}
                                icon={<Database className="size-4" />}
                                label={t("dataUpload.source.thirdPartyApi")}
                                disabled={isBusy}
                                onClick={() => onSourceChange?.("THIRD_PARTY_API")}
                            />
                        </div>
                    </FieldBlock>

                    <FieldBlock
                        label={isApiSource ? t("dataUpload.input.mapper.label") : t("dataUpload.input.mapper.optionalLabel")}
                        tooltip={isApiSource ? t("dataUpload.input.mapper.apiDescription") : t("dataUpload.input.mapper.fileDescription")}
                        required={isApiSource}
                    >
                        <Select value={mapperId} onValueChange={(value) => onMapperChange?.(value ?? "")} disabled={isBusy}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("dataUpload.input.mapper.placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {visibleMapperOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldBlock>

                    <div
                        className={cn(
                            "rounded-lg border bg-background p-4 transition-colors",
                            deleteExisting
                                ? "border-destructive/35 bg-destructive/5"
                                : "border-border",
                        )}
                    >
                        <label className="flex items-start gap-3">
                            <Checkbox
                                checked={deleteExisting}
                                disabled={isBusy}
                                onCheckedChange={(checked) => onDeleteExistingChange?.(checked === true)}
                                className="mt-0.5"
                            />
                            <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                    <Trash2
                                        className={cn(
                                            "size-4",
                                            deleteExisting ? "text-destructive" : "text-muted-foreground",
                                        )}
                                    />
                                    <FormFieldLabel
                                        label={t("dataUpload.input.replaceExisting.label")}
                                        className={cn(
                                            "text-sm",
                                            deleteExisting ? "text-destructive" : "text-foreground",
                                        )}
                                    />
                                </span>
                                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                                    {deleteExisting
                                        ? t("dataUpload.input.replaceExisting.activeDescription")
                                        : t("dataUpload.input.replaceExisting.description")}
                                </span>
                            </span>
                        </label>

                        {deleteExisting ? (
                            <div className="mt-4 space-y-2 border-t border-destructive/20 pt-4">
                                <div className="text-sm font-medium text-destructive">
                                    {t("dataUpload.input.instructionNo.label")}
                                </div>
                                <LookupPicker
                                    title={t("dataUpload.input.instructionNo.lookup")}
                                    value={existingInstructionNo || undefined}
                                    options={resolvedInstructionOptions}
                                    selectedOptions={selectedInstructionOptions}
                                    pageQuery={existingInstructionPageQuery}
                                    serverSide={Boolean(existingInstructionPageQuery)}
                                    searchFields={existingInstructionSearchFields ?? ["instructionNo"]}
                                    buildFilter={existingInstructionBuildFilter}
                                    onChange={(value) => onExistingInstructionNoChange?.(value)}
                                    onClear={() => onExistingInstructionNoChange?.("")}
                                    placeholder={t("dataUpload.input.instructionNo.placeholder")}
                                    searchPlaceholder={t("dataUpload.input.instructionNo.searchPlaceholder")}
                                    emptyMessage={t("dataUpload.input.instructionNo.empty")}
                                    disabled={isBusy}
                                    icon={<Search className="size-4 text-muted-foreground" />}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            <aside className="flex flex-col justify-between gap-6 border-t border-border bg-background/40 p-5 md:p-6 lg:border-l lg:border-t-0">
                {isApiSource ? (
                    <div className="flex min-h-80 flex-col justify-center rounded-xl border border-primary/15 bg-primary/5 p-6">
                        <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Settings2 className="size-7" />
                        </div>
                        <h3 className="mt-5 text-lg font-semibold text-foreground">
                            {t("dataUpload.input.api.title")}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {t("dataUpload.input.api.description")}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <span className="rounded-md border border-primary/20 bg-background px-2.5 py-1 text-xs font-medium text-primary">
                                {t("dataUpload.input.api.requirement.mapper")}
                            </span>
                            <span className="rounded-md border border-primary/20 bg-background px-2.5 py-1 text-xs font-medium text-primary">
                                {t("dataUpload.input.api.requirement.noFile")}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <label
                            htmlFor={inputId}
                            onDragEnter={(event) => {
                                event.preventDefault();
                                if (!isBusy) setIsDragging(true);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                if (!isBusy) setIsDragging(true);
                            }}
                            onDragLeave={(event) => {
                                event.preventDefault();
                                setIsDragging(false);
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                setIsDragging(false);
                                if (!isBusy) handleFiles(event.dataTransfer.files);
                            }}
                            className={cn(
                                "flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/[0.03] px-6 py-10 text-center transition",
                                "hover:border-primary/60 hover:bg-primary/[0.06]",
                                isDragging && "border-primary bg-primary/10",
                                isBusy && "cursor-not-allowed opacity-70",
                            )}
                        >
                            <input
                                ref={inputRef}
                                id={inputId}
                                type="file"
                                accept={accept}
                                disabled={isBusy}
                                className="sr-only"
                                onChange={(event) => handleFiles(event.target.files)}
                            />

                            <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
                                <FileUp className="size-9" />
                            </span>
                            <span className="mt-6 text-lg font-semibold text-foreground">
                                {dropTitle ?? t("dataUpload.input.dropTitle")}
                            </span>
                            <span className="mt-2 text-sm text-muted-foreground">
                                {dropDescription ?? t("dataUpload.input.dropDescription")}
                            </span>
                            <span className="mt-4 text-sm font-medium text-muted-foreground">
                                {fileHint ?? t("dataUpload.input.fileHint")}
                            </span>
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                disabled={isBusy}
                                onClick={() => inputRef.current?.click()}
                            >
                                <FolderOpen className="size-4" />
                                {t("dataUpload.actions.browseFile")}
                            </Button>
                            <span className="min-w-0 text-sm text-muted-foreground">
                                {file ? (
                                    <>
                                        {t("dataUpload.fields.selected")}:{" "}
                                        <span className="font-medium text-foreground">{file.name}</span>
                                    </>
                                ) : (
                                    emptyFileLabel ?? t("dataUpload.input.emptyFile")
                                )}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    {!isApiSource ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onDownloadTemplate}
                            disabled={isBusy}
                        >
                            <Download className="size-4" />
                            {isDownloadingTemplate ? t("dataUpload.actions.downloading") : downloadLabel ?? t("dataUpload.actions.downloadTemplate")}
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        onClick={onUpload}
                        disabled={!canSubmit}
                    >
                        <Upload className="size-4" />
                        {isUploading
                            ? t("dataUpload.actions.uploading")
                            : isApiSource
                                ? fetchLabel ?? t("dataUpload.actions.fetchData")
                                : uploadLabel ?? t("dataUpload.actions.uploadFile")}
                    </Button>
                </div>
            </aside>
        </div>
    );
}

type FieldBlockProps = {
    label: string;
    description?: string;
    tooltip?: ReactNode;
    required?: boolean;
    children: ReactNode;
};

function FieldBlock({
    label,
    description,
    tooltip,
    required,
    children,
}: FieldBlockProps) {
    return (
        <div className="space-y-2">
            <FormFieldLabel label={label} required={required} tooltip={tooltip} />
            {children}
            {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
    );
}

function SourceButton({
    active,
    icon,
    label,
    disabled,
    onClick,
}: {
    active: boolean;
    icon: ReactNode;
    label: string;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant={active ? "default" : "ghost"}
            disabled={disabled}
            onClick={onClick}
            className="justify-center"
        >
            {icon}
            {label}
        </Button>
    );
}
