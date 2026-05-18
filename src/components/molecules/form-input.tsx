import { useState, type ComponentProps, type ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import {
    Field,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import { FormFieldLabel } from "@/components/molecules/form-field-label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const defaultIconMap: Record<string, ReactNode> = {
    email: <Mail className="size-4 text-muted-foreground" />,
    username: <User className="size-4 text-muted-foreground" />,
    password: <Lock className="size-4 text-muted-foreground" />,
};

type FormInputProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    labelAction?: ReactNode;
    required?: boolean;
    icon?: ReactNode | null;
    className?: string;
    inputClassName?: string;
} & Omit<ComponentProps<typeof Input>, "name" | "form" | "className">;

export function FormInput<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    description,
    tooltip,
    labelAction,
    required,
    icon,
    className,
    inputClassName,
    type,
    ...inputProps
}: FormInputProps<TFieldValues>) {
    const [showPassword, setShowPassword] = useState(false);
    const error = form.formState.errors[name];
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const resolvedIcon =
        icon === null
            ? null
            : icon ?? defaultIconMap[name] ?? defaultIconMap[type ?? ""] ?? null;

    return (
        <Field className={className}>
            <FormFieldLabel
                htmlFor={name}
                label={label}
                required={required}
                tooltip={tooltip}
                labelAction={labelAction}
            />

            {resolvedIcon || isPassword ? (
                <div className="relative">
                    {resolvedIcon ? (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            {resolvedIcon}
                        </span>
                    ) : null}

                    <Input
                        id={name}
                        type={inputType}
                        aria-invalid={Boolean(error)}
                        className={cn(
                            resolvedIcon && "pl-9",
                            isPassword && "pr-10",
                            inputClassName,
                        )}
                        {...inputProps}
                        {...form.register(name)}
                    />

                    {isPassword ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    ) : null}
                </div>
            ) : (
                <Input
                    id={name}
                    type={inputType}
                    aria-invalid={Boolean(error)}
                    className={inputClassName}
                    {...inputProps}
                    {...form.register(name)}
                />
            )}

            {description && !error ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}

            {error ? (
                <FieldError>{error.message as string}</FieldError>
            ) : null}
        </Field>
    );
}
