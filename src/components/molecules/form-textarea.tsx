import type { ComponentProps, ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { FormFieldLabel } from "@/components/molecules/form-field-label";
import {
    Field,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type FormTextareaProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    labelAction?: ReactNode;
    required?: boolean;
    className?: string;
    textareaClassName?: string;
} & Omit<ComponentProps<typeof Textarea>, "name" | "form" | "className">;

export function FormTextarea<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    description,
    tooltip,
    labelAction,
    required,
    className,
    textareaClassName,
    ...textareaProps
}: FormTextareaProps<TFieldValues>) {
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

            <Textarea
                id={name}
                aria-invalid={Boolean(error)}
                className={textareaClassName}
                {...textareaProps}
                {...form.register(name)}
            />

            {description && !error ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}

            {error ? <FieldError>{error.message as string}</FieldError> : null}
        </Field>
    );
}
