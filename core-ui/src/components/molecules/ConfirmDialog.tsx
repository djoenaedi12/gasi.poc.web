import { cloneElement, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
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
} from "../ui/alert-dialog";
import { cn } from "../../lib/utils";

type ConfirmDialogProps = {
    trigger?: ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
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
    open: controlledOpen,
    onOpenChange,
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
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = (nextOpen: boolean) => {
        setUncontrolledOpen(nextOpen);
        onOpenChange?.(nextOpen);
    };
    const isLoading = loading ?? isSubmitting;
    const triggerProps = trigger?.props as { onClick?: (event: MouseEvent) => void } | undefined;
    const triggerElement = trigger
        ? cloneElement(trigger as ReactElement<{ onClick?: (event: MouseEvent) => void }>, {
            onClick: (event: MouseEvent) => {
                triggerProps?.onClick?.(event);

                if (event.defaultPrevented) {
                    return;
                }

                event.preventDefault();
                setOpen(true);
            },
        })
        : null;
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
            {triggerElement}

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
