import { Search } from "lucide-react";
import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";

import { FormFieldLabel } from "./FormFieldLabel";
import {
    Field,
    FieldDescription,
} from "../ui/field";
import { FormFieldError } from "./FormFieldError";
import {
    LookupPicker,
    type LookupDisplayColumn,
    type LookupOption,
    type LookupPreset,
} from "./LookupPicker";
import type { GenericFilter, PageResult, SearchRequest } from "../../types/api.types";

type FormLookupPickerBaseProps<
    TFieldValues extends FieldValues,
    TLookupData = LookupOption,
> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    lookup?: LookupPreset<TLookupData>;
    options?: LookupOption[];
    selectedOptions?: LookupOption[];
    displayColumns?: LookupDisplayColumn[];
    pageQuery?: (
        request: SearchRequest,
    ) => UseQueryResult<PageResult<TLookupData> | undefined, unknown>;
    mapOption?: (item: TLookupData) => LookupOption;
    serverSide?: boolean;
    searchFields?: string[];
    buildFilter?: (search: string) => GenericFilter | undefined;
    description?: ReactNode;
    tooltip?: ReactNode;
    labelAction?: ReactNode;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

type FormLookupPickerSingleProps<
    TFieldValues extends FieldValues,
    TLookupData = LookupOption,
> =
    FormLookupPickerBaseProps<TFieldValues, TLookupData> & {
        multiple?: false;
    };

type FormLookupPickerMultipleProps<
    TFieldValues extends FieldValues,
    TLookupData = LookupOption,
> =
    FormLookupPickerBaseProps<TFieldValues, TLookupData> & {
        multiple: true;
    };

type FormLookupPickerProps<
    TFieldValues extends FieldValues,
    TLookupData = LookupOption,
> =
    | FormLookupPickerSingleProps<TFieldValues, TLookupData>
    | FormLookupPickerMultipleProps<TFieldValues, TLookupData>;

export function FormLookupPicker<
    TFieldValues extends FieldValues,
    TLookupData = LookupOption,
>(
    props: FormLookupPickerProps<TFieldValues, TLookupData>,
) {
    const {
        form,
        name,
        label,
        lookup,
        options,
        selectedOptions,
        displayColumns,
        pageQuery,
        mapOption,
        serverSide,
        searchFields,
        buildFilter,
        description,
        tooltip,
        labelAction,
        placeholder,
        searchPlaceholder,
        emptyMessage,
        required,
        disabled,
        className,
        multiple,
    } = props;

    const error = form.formState.errors[name];

    return (
        <Field className={className}>
            <FormFieldLabel
                htmlFor={name}
                label={label}
                required={required}
                tooltip={tooltip}
                labelAction={labelAction}
            />

            <Controller
                control={form.control}
                name={name}
                render={({ field }) =>
                    multiple ? (
                        <LookupPicker
                            multiple
                            title={label}
                            lookup={lookup}
                            options={options}
                            selectedOptions={selectedOptions}
                            displayColumns={displayColumns}
                            pageQuery={pageQuery}
                            mapOption={mapOption}
                            serverSide={serverSide}
                            searchFields={searchFields}
                            buildFilter={buildFilter}
                            value={(field.value as string[]) ?? []}
                            onChange={(value) => field.onChange(value)}
                            onClear={() => field.onChange([])}
                            placeholder={placeholder}
                            searchPlaceholder={searchPlaceholder}
                            emptyMessage={emptyMessage}
                            disabled={disabled}
                            aria-invalid={Boolean(error)}
                            icon={<Search className="size-4 text-muted-foreground" />}
                        />
                    ) : (
                        <LookupPicker
                            title={label}
                            lookup={lookup}
                            options={options}
                            selectedOptions={selectedOptions}
                            displayColumns={displayColumns}
                            pageQuery={pageQuery}
                            mapOption={mapOption}
                            serverSide={serverSide}
                            searchFields={searchFields}
                            buildFilter={buildFilter}
                            value={(field.value as string) ?? undefined}
                            onChange={(value) => field.onChange(value)}
                            onClear={() => field.onChange(undefined)}
                            placeholder={placeholder}
                            searchPlaceholder={searchPlaceholder}
                            emptyMessage={emptyMessage}
                            disabled={disabled}
                            aria-invalid={Boolean(error)}
                            icon={<Search className="size-4 text-muted-foreground" />}
                        />
                    )
                }
            />

            {description && !error ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}

            {error ? <FormFieldError error={error} /> : null}
        </Field>
    );
}
