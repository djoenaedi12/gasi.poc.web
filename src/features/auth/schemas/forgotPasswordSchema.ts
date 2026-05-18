import { z } from "zod";

export const forgotPasswordSchema = z.object({
    username: z.string().min(3, "Username minimal 3 karakter"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
