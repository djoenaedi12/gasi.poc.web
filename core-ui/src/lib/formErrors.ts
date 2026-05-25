import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type ApiErrorLike = {
    response?: {
        data?: {
            fieldErrors?: Record<string, string[]>;
        };
    };
};

export function getApiFieldErrors(error: unknown) {
    if (!error || typeof error !== "object") {
        return undefined;
    }

    return (error as ApiErrorLike).response?.data?.fieldErrors;
}

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues>,
    error: unknown,
) {
    const fieldErrors = getApiFieldErrors(error);

    if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
        return false;
    }

    Object.entries(fieldErrors).forEach(([field, messages]) => {
        const filteredMessages = messages.filter(Boolean);

        form.setError(field as FieldPath<TFieldValues>, {
            type: "server",
            message: filteredMessages[0],
            types: Object.fromEntries(
                filteredMessages.map((message, index) => [`server${index}`, message]),
            ),
        });
    });

    return true;
}
