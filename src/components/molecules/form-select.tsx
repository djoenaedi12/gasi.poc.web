import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";
import type { ReactNode } from "react";

import { FormFieldLabel } from "@/components/molecules/form-field-label";
import {
    Field,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type SelectOption = {
    label: string;
    value: string;
};

type FormSelectProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    options: SelectOption[];
    placeholder?: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

export function FormSelect<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    options,
    placeholder,
    description,
    tooltip,
    required,
    disabled,
    className,
}: FormSelectProps<TFieldValues>) {
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
                render={({ field }) => (
                    <Select
                        value={(field.value as string) ?? ""}
                        onValueChange={field.onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger
                            id={name}
                            className="w-full"
                            aria-invalid={Boolean(error)}
                        >
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>

                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />

            {description && !error ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}

            {error ? <FieldError>{error.message as string}</FieldError> : null}
        </Field>
    );
}
