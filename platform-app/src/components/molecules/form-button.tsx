import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type FormButtonProps = ComponentProps<typeof Button> & {
    loading?: boolean;
    loadingText?: ReactNode;
};

export function FormButton({
    loading,
    loadingText,
    disabled,
    children,
    type = "submit",
    ...props
}: FormButtonProps) {
    return (
        <Button type={type} disabled={disabled || loading} {...props}>
            {loading ? <Spinner /> : null}
            {loading && loadingText ? loadingText : children}
        </Button>
    );
}
