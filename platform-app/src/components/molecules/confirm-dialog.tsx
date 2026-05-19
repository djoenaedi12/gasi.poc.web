import { useState, type ReactElement, type ReactNode } from "react";
import { CircleHelp, LoaderCircle, TriangleAlert } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
    trigger: ReactElement;
    title?: ReactNode;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    destructive?: boolean;
    icon?: ReactNode;
    size?: "default" | "sm";
    loading?: boolean;
};

export function ConfirmDialog({
    trigger,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmLabel = "Continue",
    cancelLabel = "Cancel",
    onConfirm,
    destructive = false,
    icon,
    size = "default",
    loading,
}: ConfirmDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isLoading = loading ?? isSubmitting;
    const resolvedIcon =
        icon ??
        (destructive ? (
            <TriangleAlert className="size-6" />
        ) : (
            <CircleHelp className="size-6" />
        ));

    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);
            await onConfirm();
            setOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger render={trigger} />

            <AlertDialogContent size={size}>
                <AlertDialogHeader>
                    <AlertDialogMedia
                        className={cn(
                            destructive
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary",
                        )}
                    >
                        {resolvedIcon}
                    </AlertDialogMedia>

                    <AlertDialogTitle>{title}</AlertDialogTitle>

                    <AlertDialogDescription className="text-sm leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        {cancelLabel}
                    </AlertDialogCancel>

                    <AlertDialogAction
                        variant={destructive ? "destructive" : "default"}
                        disabled={isLoading}
                        onClick={handleConfirm}
                    >
                        {isLoading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : null}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
