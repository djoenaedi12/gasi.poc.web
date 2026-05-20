import type { ReactNode } from "react"
import { Info } from "lucide-react"

import { FieldLabel } from "../ui/field"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "../ui/tooltip"

type FormFieldLabelProps = {
    htmlFor?: string
    label: ReactNode
    required?: boolean
    tooltip?: ReactNode
    labelAction?: ReactNode
    className?: string
}

export function FormFieldLabel({
    htmlFor,
    label,
    required,
    tooltip,
    labelAction,
    className,
}: FormFieldLabelProps) {
    return (
        <div className="flex items-center">
            <div className="flex min-w-0 items-center gap-1.5">
                <FieldLabel htmlFor={htmlFor} className={className}>
                    {label}
                    {required ? (
                        <span className="ml-1 text-destructive">*</span>
                    ) : null}
                </FieldLabel>

                {tooltip ? (
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <button
                                    type="button"
                                    className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                />
                            }
                        >
                            <Info className="size-3.5" />
                            <span className="sr-only">Field information</span>
                        </TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
                    </Tooltip>
                ) : null}
            </div>

            {labelAction ? <div className="ml-auto">{labelAction}</div> : null}
        </div>
    )
}
