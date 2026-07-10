import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Введіть email.").email("Некоректний email."),
  password: z.string().min(1, "Введіть пароль."),
});
export type LoginInput = z.infer<typeof loginSchema>;

const passwordSchema = z.string().min(8, "Пароль має містити щонайменше 8 символів.");

export const registerSchema = z
  .object({
    email: z.string().min(1, "Введіть email.").email("Некоректний email."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Підтвердіть пароль."),
    turnstileToken: z.string().min(1, "Підтвердіть, що ви не робот."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не збігаються.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Введіть email.").email("Некоректний email."),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Підтвердіть пароль."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не збігаються.",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
