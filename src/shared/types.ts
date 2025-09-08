/**
 * Types shared between the client and server go here.
 *
 * For example, we can add zod schemas for API input validation, and derive types from them:
 *
 * import z from "zod";
 *
 * export const TodoSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 *   completed: z.number().int(), // 0 or 1
 * })
 *
 * export type TodoType = z.infer<typeof TodoSchema>;
 */

// Authentication Types
export type UserType = 'consumer' | 'enterprise' | 'power-user';

export interface User {
  id: string;
  did: string;
  email?: string;
  name?: string;
  type: UserType;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  did: string;
  passphrase: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginBiometric: (credentialData?: {
    id: string;
    rawId: ArrayBuffer;
    response: {
      authenticatorData: ArrayBuffer;
      clientDataJSON: ArrayBuffer;
      signature: ArrayBuffer;
      userHandle?: ArrayBuffer;
    };
    type: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Form Validation Schemas
import { z } from "zod"

// Authentication Forms
export const loginCredentialsSchema = z.object({
  did: z.string().min(1, "DID is required"),
  passphrase: z.string().min(1, "Passphrase is required"),
})

export const passphraseLoginSchema = z.object({
  passphrase: z.string().min(12, "Passphrase must be at least 12 characters"),
})

export const didLoginSchema = z.object({
  did: z.string().min(1, "DID is required").regex(/^did:/, "Must be a valid DID"),
})

// Credential Forms
export const credentialSchema = z.object({
  name: z.string()
    .min(1, "Credential name is required")
    .max(100, "Credential name must be less than 100 characters"),
  type: z.string().min(1, "Credential type is required"),
  issuer: z.string()
    .min(1, "Issuer is required")
    .max(100, "Issuer name must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  expirationDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const expirationDate = new Date(date);
      const now = new Date();
      return expirationDate > now;
    }, "Expiration date must be in the future"),
  issueDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const issueDate = new Date(date);
      const now = new Date();
      return issueDate <= now;
    }, "Issue date cannot be in the future"),
  metadata: z.record(z.any()).optional(),
})

// Add Credential Form Type
export type CredentialForm = z.infer<typeof credentialSchema>

// Manual Credential Entry Schema
export const manualCredentialSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  issuer: z.string()
    .min(1, "Issuer is required")
    .max(100, "Issuer must be less than 100 characters"),
  type: z.enum(['education', 'employment', 'license', 'certification', 'achievement'], {
    errorMap: () => ({ message: "Please select a valid credential type" })
  }),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  issueDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const issueDate = new Date(date);
      const now = new Date();
      return issueDate <= now;
    }, "Issue date cannot be in the future"),
  expiryDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const expiryDate = new Date(date);
      const now = new Date();
      return expiryDate > now;
    }, "Expiry date must be in the future"),
})

// Add Manual Credential Form Type
export type ManualCredentialForm = z.infer<typeof manualCredentialSchema>

// Settings Forms
export const profileSettingsSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  bio: z.string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
})

export const securitySettingsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Enhanced Security Settings Schema
export const enhancedSecuritySettingsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number, and special character"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
  twoFactorEnabled: z.boolean().optional(),
  biometricEnabled: z.boolean().optional(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
})

// Contact/Handshake Form Schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string()
    .email("Invalid email address"),
  subject: z.string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject must be less than 100 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
  urgency: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: "Please select a valid urgency level" })
  }).optional(),
})

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine((file) => ['application/json', 'application/pdf', 'application/ld+json'].includes(file.type),
      "File must be JSON, PDF, or VC format"),
  description: z.string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
})

// QR Code Data Schema
export const qrDataSchema = z.object({
  data: z.string()
    .min(1, "QR data is required")
    .max(2000, "QR data must be less than 2000 characters"),
  format: z.enum(['text', 'url', 'json', 'vc'], {
    errorMap: () => ({ message: "Please select a valid format" })
  }),
  description: z.string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
})

// Onboarding Form Schema
export const onboardingSchema = z.object({
  userType: z.enum(['consumer', 'enterprise', 'power-user'], {
    errorMap: () => ({ message: "Please select a valid user type" })
  }),
  fullName: z.string()
    .min(1, "Full name is required")
    .max(50, "Full name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  organization: z.string()
    .max(100, "Organization must be less than 100 characters")
    .optional(),
  role: z.string()
    .max(50, "Role must be less than 50 characters")
    .optional(),
  agreeToTerms: z.boolean()
    .refine((val) => val === true, "You must agree to the terms and conditions"),
  agreeToPrivacy: z.boolean()
    .refine((val) => val === true, "You must agree to the privacy policy"),
  marketingConsent: z.boolean().optional(),
})

// API Integration Schema
export const apiIntegrationSchema = z.object({
  name: z.string()
    .min(1, "Integration name is required")
    .max(50, "Name must be less than 50 characters"),
  description: z.string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  baseUrl: z.string()
    .url("Must be a valid URL"),
  apiKey: z.string()
    .min(10, "API key must be at least 10 characters"),
  headers: z.record(z.string()).optional(),
  timeout: z.number()
    .min(1000, "Timeout must be at least 1000ms")
    .max(30000, "Timeout must be less than 30000ms")
    .optional(),
})

// Type exports
export type LoginCredentialsForm = z.infer<typeof loginCredentialsSchema>
export type PassphraseLoginForm = z.infer<typeof passphraseLoginSchema>
export type DIDLoginForm = z.infer<typeof didLoginSchema>
export type ProfileSettingsForm = z.infer<typeof profileSettingsSchema>
export type SecuritySettingsForm = z.infer<typeof securitySettingsSchema>
export type EnhancedSecuritySettingsForm = z.infer<typeof enhancedSecuritySettingsSchema>
export type ContactForm = z.infer<typeof contactFormSchema>
export type FileUploadForm = z.infer<typeof fileUploadSchema>
export type QRDataForm = z.infer<typeof qrDataSchema>
export type OnboardingForm = z.infer<typeof onboardingSchema>
export type APIIntegrationForm = z.infer<typeof apiIntegrationSchema>
