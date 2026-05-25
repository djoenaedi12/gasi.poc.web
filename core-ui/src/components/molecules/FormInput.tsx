import { useState, type ComponentProps, type ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import {
    Field,
    FieldDescription,
} from "../ui/field";
import { FormFieldError } from "./FormFieldError";
import { FormFieldLabel } from "./FormFieldLabel";
import { Input } from "../ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";

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
    loading?: boolean;
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
    loading,
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

            {resolvedIcon || isPassword || loading ? (
                <InputGroup>
                    {resolvedIcon ? (
                        <InputGroupAddon>
                            {resolvedIcon}
                        </InputGroupAddon>
                    ) : null}

                    <InputGroupInput
                        id={name}
                        type={inputType}
                        aria-invalid={Boolean(error)}
                        className={inputClassName}
                        {...inputProps}
                        {...form.register(name)}
                    />

                    {loading || isPassword ? (
                        <InputGroupAddon align="inline-end">
                            {loading ? <Spinner /> : null}

                            {isPassword ? (
                                <InputGroupButton
                                    type="button"
                                    size="icon-xs"
                                    onClick={() =>
                                        setShowPassword((value) => !value)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </InputGroupButton>
                            ) : null}
                        </InputGroupAddon>
                    ) : null}
                </InputGroup>
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

            {error ? <FormFieldError error={error} /> : null}
        </Field>
    );
}
