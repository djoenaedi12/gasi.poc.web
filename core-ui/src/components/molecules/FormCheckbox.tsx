import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";
import type { ReactNode } from "react";

import { FormFieldLabel } from "./FormFieldLabel";
import { Checkbox } from "../ui/checkbox";
import {
    Field,
    FieldContent,
    FieldDescription,
} from "../ui/field";
import { FormFieldError } from "./FormFieldError";
import { cn } from "../../lib/utils";

type FormCheckboxProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    labelAction?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

export function FormCheckbox<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    description,
    tooltip,
    labelAction,
    required,
    disabled,
    className,
}: FormCheckboxProps<TFieldValues>) {
    const error = form.formState.errors[name];

    return (
        <Field className={className}>
            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id={name}
                            checked={Boolean(field.value)}
                            onCheckedChange={(checked) =>
                                field.onChange(Boolean(checked))
                            }
                            disabled={disabled}
                            aria-invalid={Boolean(error)}
                        />

                        <FieldContent>
                            <FormFieldLabel
                                htmlFor={name}
                                label={label}
                                required={required}
                                tooltip={tooltip}
                                labelAction={labelAction}
                                className={cn(
                                    "cursor-pointer",
                                    disabled && "cursor-not-allowed opacity-70",
                                )}
                            />

                            {description && !error ? (
                                <FieldDescription>
                                    {description}
                                </FieldDescription>
                            ) : null}

                            {error ? <FormFieldError error={error} /> : null}
                        </FieldContent>
                    </div>
                )}
            />
        </Field>
    );
}
