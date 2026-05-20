"use client";

import { useRef, useState, type ReactNode } from "react";

import { Stepper, type StepperItem } from "./Stepper";
import { cn } from "../../lib/utils";

type StepperWizardProps = {
    steps: StepperItem[];
    currentStep: number;
    onStepChange: (stepIndex: number) => void;
    orientation?: "horizontal" | "vertical";
    validateStep?: boolean;
    onValidateStep?: (
        currentStep: number,
        targetStep: number,
    ) => Promise<boolean> | boolean;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
};

export function StepperWizard({
    steps,
    currentStep,
    onStepChange,
    orientation = "horizontal",
    validateStep = false,
    onValidateStep,
    children,
    className,
    contentClassName,
}: StepperWizardProps) {
    const [isValidating, setIsValidating] = useState(false);
    const validationRunRef = useRef(0);

    async function goToStep(targetStep: number) {
        if (isValidating) return;
        if (targetStep === currentStep) return;
        if (targetStep < 0 || targetStep >= steps.length) return;

        if (validateStep && onValidateStep) {
            const validationRun = validationRunRef.current + 1;
            validationRunRef.current = validationRun;
            setIsValidating(true);

            try {
                const valid = await onValidateStep(currentStep, targetStep);

                if (validationRun !== validationRunRef.current || !valid) return;
            } finally {
                if (validationRun === validationRunRef.current) {
                    setIsValidating(false);
                }
            }
        }

        onStepChange(targetStep);
    }

    const isVertical = orientation === "vertical";

    return (
        <div
            className={cn(
                isVertical
                    ? "space-y-6 md:grid md:grid-cols-[240px_1fr] md:gap-6 md:space-y-0"
                    : "space-y-6",
                className,
            )}
        >
            <Stepper
                steps={steps}
                currentStep={currentStep}
                orientation={orientation}
                onStepClick={goToStep}
                disabled={isValidating}
            />

            <div className={contentClassName}>{children}</div>
        </div>
    );
}
