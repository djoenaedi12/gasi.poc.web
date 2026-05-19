import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Link } from "react-router"

import { FormButton } from "@/components/molecules/form-button"
import { FormInput } from "@/components/molecules/form-input"
import {
    FieldDescription,
    FieldGroup,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"
import {
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from "../schemas/forgotPasswordSchema"

function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            username: "",
        },
    })

    const username = useWatch({
        control: form.control,
        name: "username",
    })

    const onSubmit = () => {
        setIsSubmitted(true)
    }

    if (isSubmitted) {
        return (
            <div className={cn("flex flex-col gap-6", className)}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h1 className="text-2xl font-bold">Check your inbox</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            If an account exists for {username || "that username"}, reset
                            instructions will be sent shortly.
                        </p>
                    </div>

                    <FormButton
                        type="button"
                        className="w-full"
                        onClick={() => setIsSubmitted(false)}
                    >
                        Try another username
                    </FormButton>

                    <FieldDescription className="text-center">
                        Remember your password?{" "}
                        <Link to="/login" className="underline underline-offset-4">
                            Back to login
                        </Link>
                    </FieldDescription>
                </FieldGroup>
            </div>
        )
    }

    return (
        <form
            className={cn("flex flex-col gap-6", className)}
            onSubmit={form.handleSubmit(onSubmit)}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Reset your password</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Enter your username and we will send reset instructions.
                    </p>
                </div>

                <FormInput
                    form={form}
                    name="username"
                    label="Username"
                    type="text"
                    placeholder="junjun"
                    required
                />

                <FormButton
                    className="w-full"
                    loading={form.formState.isSubmitting}
                    loadingText="Sending..."
                >
                    Send reset instructions
                </FormButton>

                <FieldDescription className="text-center">
                    Remember your password?{" "}
                    <Link to="/login" className="underline underline-offset-4">
                        Back to login
                    </Link>
                </FieldDescription>
            </FieldGroup>
        </form>
    )
}

export function ForgotPasswordPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/placeholder.svg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link to="/login" className="flex items-center gap-2 font-medium">
                        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Acme Inc.
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <Link
                            to="/login"
                            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to login
                        </Link>
                        <ForgotPasswordForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage
