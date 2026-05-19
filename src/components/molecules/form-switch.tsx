import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";
import type { ComponentProps, ReactNode } from "react";

import { FormFieldLabel } from "@/components/molecules/form-field-label";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type FormSwitchProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    required?: boolean;
    className?: string;
} & Omit<
    ComponentProps<typeof Switch>,
    "checked" | "defaultChecked" | "onCheckedChange" | "name" | "form"
>;

export function FormSwitch<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    description,
    tooltip,
    required,
    className,
    disabled,
    ...switchProps
}: FormSwitchProps<TFieldValues>) {
    const error = form.formState.errors[name];

    return (
        <Field className={className}>
            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <div className="flex items-start gap-3">
                        <Switch
                            id={name}
                            checked={Boolean(field.value)}
                            onCheckedChange={(checked) =>
                                field.onChange(Boolean(checked))
                            }
                            disabled={disabled}
                            aria-invalid={Boolean(error)}
                            {...switchProps}
                        />

                        <FieldContent>
                            <FormFieldLabel
                                htmlFor={name}
                                label={label}
                                required={required}
                                tooltip={tooltip}
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

                            {error ? (
                                <FieldError>
                                    {error.message as string}
                                </FieldError>
                            ) : null}
                        </FieldContent>
                    </div>
                )}
            />
        </Field>
    );
}
