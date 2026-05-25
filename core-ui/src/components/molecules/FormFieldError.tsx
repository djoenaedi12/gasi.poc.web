import { FieldError } from "../ui/field";

type HookFormErrorLike = {
    message?: unknown;
    types?: Record<string, unknown>;
};

type FormFieldErrorProps = {
    error?: HookFormErrorLike;
};

function getErrorMessages(error?: HookFormErrorLike) {
    if (!error) {
        return [];
    }

    const messages = [
        error.message,
        ...Object.values(error.types ?? {}).flatMap((value) =>
            Array.isArray(value) ? value : [value],
        ),
    ].filter((message): message is string => typeof message === "string" && message.trim() !== "");

    return [...new Set(messages)];
}

export function FormFieldError({ error }: FormFieldErrorProps) {
    const messages = getErrorMessages(error);

    if (!messages.length) {
        return null;
    }

    return <FieldError errors={messages.map((message) => ({ message }))} />;
}
