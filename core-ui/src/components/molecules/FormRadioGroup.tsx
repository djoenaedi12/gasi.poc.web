import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";
import type { ReactNode } from "react";

import { FormFieldLabel } from "./FormFieldLabel";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "../../lib/utils";

type RadioOption = {
    label: string;
    value: string;
    description?: string;
    disabled?: boolean;
};

type FormRadioGroupProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    options: RadioOption[];
    description?: ReactNode;
    tooltip?: ReactNode;
    labelAction?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    orientation?: "vertical" | "horizontal";
};

export function FormRadioGroup<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    options,
    description,
    tooltip,
    labelAction,
    required,
    disabled,
    className,
    orientation = "vertical",
}: FormRadioGroupProps<TFieldValues>) {
    const error = form.formState.errors[name];

    return (
        <Field className={className}>
            <FormFieldLabel
                label={label}
                required={required}
                tooltip={tooltip}
                labelAction={labelAction}
            />

            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <RadioGroup
                        value={(field.value as string) ?? ""}
                        onValueChange={field.onChange}
                        disabled={disabled}
                        aria-invalid={Boolean(error)}
                        className={cn(
                            orientation === "horizontal"
                                ? "flex flex-wrap gap-4"
                                : "grid gap-3",
                        )}
                    >
                        {options.map((option) => {
                            const itemId = `${name}-${option.value}`;

                            return (
                                <div
                                    key={option.value}
                                    className="flex items-start gap-3"
                                >
                                    <RadioGroupItem
                                        id={itemId}
                                        value={option.value}
                                        disabled={disabled || option.disabled}
                                    />

                                    <div className="grid gap-1.5 leading-none">
                                        <FieldLabel
                                            htmlFor={itemId}
                                            className={cn(
                                                "cursor-pointer font-normal",
                                                (disabled || option.disabled) &&
                                                "cursor-not-allowed opacity-70",
                                            )}
                                        >
                                            {option.label}
                                        </FieldLabel>

                                        {option.description ? (
                                            <FieldDescription>
                                                {option.description}
                                            </FieldDescription>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </RadioGroup>
                )}
            />

            {description && !error ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}

            {error ? <FieldError>{error.message as string}</FieldError> : null}
        </Field>
    );
}
