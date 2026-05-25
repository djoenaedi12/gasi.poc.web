import { toast } from "sonner";

type AppToastOptions = {
    description?: string;
};

function getErrorContent(error: unknown, fallback: string) {
    if (!error || typeof error !== "object") {
        return { title: fallback };
    }

    const maybeError = error as {
        message?: string;
        response?: {
            data?: {
                message?: string;
                error?: string;
                detail?: string;
                title?: string;
                errors?: string[];
            };
        };
    };
    const data = maybeError.response?.data;
    const title =
        data?.message
        ?? data?.error
        ?? data?.detail
        ?? data?.title
        ?? maybeError.message
        ?? fallback;
    const details = data?.errors?.filter(Boolean);

    return {
        title,
        description: details?.length ? details.join("\n") : undefined,
    };
}

export const appToast = {
    success: (message: string, options?: AppToastOptions) => toast.success(message, options),
    error: (error: unknown, fallback: string) => {
        const content = getErrorContent(error, fallback);
        return toast.error(content.title, { description: content.description });
    },
    info: (message: string, options?: AppToastOptions) => toast.info(message, options),
    warning: (message: string, options?: AppToastOptions) => toast.warning(message, options),
};
