import { z } from "zod";

const stringField = (min: number, max: number, fieldName: string) =>
  z
    .string()
    .min(min, { message: `${fieldName} must have at least ${min} characters` })
    .max(max, { message: `${fieldName} must have a maximum of ${max} characters` });

const emailField = (fieldName: string) =>
  z
    .string()
    .email({ message: `Please enter a valid ${fieldName} address` })
    .max(191, { message: `${fieldName} must have a maximum of 191 characters` });

export const forgotPasswordSchema = z.object({
  email: emailField("Email"),
});

export const verifyForgotPasswordSchema = z
  .object({
    token: stringField(50, 1024, "Token"),
    password: stringField(6, 191, "Password"),
    confirmPassword: stringField(6, 191, "Confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
