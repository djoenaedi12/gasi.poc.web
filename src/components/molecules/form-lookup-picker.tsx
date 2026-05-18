import { Search } from "lucide-react";
import type { ReactNode } from "react";
import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";

import { FormFieldLabel } from "@/components/molecules/form-field-label";
import {
    Field,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import {
    LookupPicker,
    type LookupOption,
} from "@/components/molecules/lookup-picker";

type FormLookupPickerBaseProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    options: LookupOption[];
    description?: ReactNode;
    tooltip?: ReactNode;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

type FormLookupPickerSingleProps<TFieldValues extends FieldValues> =
    FormLookupPickerBaseProps<TFieldValues> & {
        multiple?: false;
    };

type FormLookupPickerMultipleProps<TFieldValues extends FieldValues> =
    FormLookupPickerBaseProps<TFieldValues> & {
        multiple: true;
    };

type FormLookupPickerProps<TFieldValues extends FieldValues> =
    | FormLookupPickerSingleProps<TFieldValues>
    | FormLookupPickerMultipleProps<TFieldValues>;

export function FormLookupPicker<TFieldValues extends FieldValues>(
    props: FormLookupPickerProps<TFieldValues>,
) {
    const {
        form,
        name,
        label,
        options,
        description,
        tooltip,
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
            />

            <Controller
                control={form.control}
                name={name}
                render={({ field }) =>
                    multiple ? (
                        <LookupPicker
                            multiple
                            title={label}
                            options={options}
                            value={(field.value as string[]) ?? []}
                            onChange={(value) => field.onChange(value)}
                            onClear={() => field.onChange([])}
                            placeholder={placeholder}
                            searchPlaceholder={searchPlaceholder}
                            emptyMessage={emptyMessage}
                            disabled={disabled}
                            icon={<Search className="size-4 text-muted-foreground" />}
                        />
                    ) : (
                        <LookupPicker
                            title={label}
                            options={options}
                            value={(field.value as string) ?? undefined}
                            onChange={(value) => field.onChange(value)}
                            onClear={() => field.onChange(undefined)}
                            placeholder={placeholder}
                            searchPlaceholder={searchPlaceholder}
                            emptyMessage={emptyMessage}
                            disabled={disabled}
                            icon={<Search className="size-4 text-muted-foreground" />}
                        />
                    )
                }
            />

            {description && !error ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}

            {error ? <FieldError>{error.message as string}</FieldError> : null}
        </Field>
    );
}
