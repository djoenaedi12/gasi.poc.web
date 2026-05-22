"use client";

import { Check } from "lucide-react";
import type { ElementType } from "react";

import { FormButton } from "./FormButton";
import { cn } from "../../lib/utils";

export type StepperItem = {
    id: string;
    title: string;
    description?: string;
    icon?: ElementType;
    disabled?: boolean;
};

type StepperProps = {
    steps: StepperItem[];
    currentStep: number;
    orientation?: "horizontal" | "vertical";
    onStepClick?: (stepIndex: number) => void | Promise<void>;
    disabled?: boolean;
    className?: string;
};

export function Stepper({
    steps,
    currentStep,
    orientation = "horizontal",
    onStepClick,
    disabled,
    className,
}: StepperProps) {
    const isVertical = orientation === "vertical";

    return (
        <nav aria-label="Progress" className={cn("w-full", className)}>
            <ol
                className={cn(
                    "flex",
                    isVertical
                        ? "flex-col gap-4"
                        : "flex-col gap-4 md:flex-row md:items-start md:gap-0",
                )}
            >
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const clickable = Boolean(onStepClick) && !step.disabled && !disabled;
                    const content = (
                        <StepContent
                            description={step.description}
                            icon={Icon}
                            index={index}
                            isActive={isActive}
                            isCompleted={isCompleted}
                            isVertical={isVertical}
                            title={step.title}
                        />
                    );

                    return (
                        <li
                            key={step.id}
                            className={cn(
                                "min-w-0",
                                isVertical ? "flex items-start" : "flex items-start md:relative md:block md:flex-1",
                            )}
                        >
                            {clickable ? (
                                <FormButton
                                    type="button"
                                    variant="ghost"
                                    aria-current={isActive ? "step" : undefined}
                                    aria-label={`${step.title}${isCompleted ? ", completed" : isActive ? ", current step" : ""}`}
                                    onClick={() => onStepClick?.(index)}
                                    className={cn(
                                        "relative z-10 h-auto min-w-0 justify-start gap-3 rounded-md p-0 text-left hover:bg-transparent disabled:cursor-not-allowed",
                                        !isVertical && "md:w-full md:flex-col md:items-center md:justify-start md:text-center",
                                    )}
                                >
                                    {content}
                                </FormButton>
                            ) : (
                                <div
                                    aria-current={isActive ? "step" : undefined}
                                    aria-disabled={step.disabled || disabled ? true : undefined}
                                    className={cn(
                                        "relative z-10 flex min-w-0 items-start gap-3 text-left",
                                        (step.disabled || disabled) && "opacity-60",
                                        !isVertical && "md:w-full md:flex-col md:items-center md:text-center",
                                    )}
                                >
                                    {content}
                                </div>
                            )}

                            {index < steps.length - 1 ? (
                                <div
                                    aria-hidden="true"
                                    className={cn(
                                        "shrink-0 bg-border",
                                        isVertical
                                            ? "ml-5 mt-10 h-8 w-px"
                                            : "ml-5 mt-10 h-8 w-px md:absolute md:left-[calc(50%+5rem)] md:top-5 md:ml-0 md:mt-0 md:h-px md:w-[calc(100%-10rem)]",
                                        isCompleted && "bg-primary",
                                    )}
                                />
                            ) : null}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

type StepContentProps = {
    description?: string;
    icon?: ElementType;
    index: number;
    isActive: boolean;
    isCompleted: boolean;
    isVertical: boolean;
    title: string;
};

function StepContent({
    description,
    icon: Icon,
    index,
    isActive,
    isCompleted,
    isVertical,
    title,
}: StepContentProps) {
    return (
        <>
            <div
                className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isActive && "border-primary text-primary",
                    !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground",
                )}
            >
                {isCompleted ? (
                    <Check aria-hidden="true" className="size-4" />
                ) : Icon ? (
                    <Icon aria-hidden="true" className="size-4" />
                ) : (
                    index + 1
                )}
            </div>

            <div className={cn("min-w-0 pt-1", !isVertical && "md:mt-2 md:space-y-1 md:pt-0")}>
                <div className="text-sm font-medium leading-5">{title}</div>

                {description ? (
                    <div
                        className={cn(
                            "text-xs leading-5 text-muted-foreground",
                            !isVertical && "md:max-w-48",
                        )}
                    >
                        {description}
                    </div>
                ) : null}
            </div>
        </>
    );
}
