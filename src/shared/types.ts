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
  loginBiometric: () => Promise<void>;
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
  name: z.string().min(1, "Credential name is required"),
  type: z.string().min(1, "Credential type is required"),
  issuer: z.string().min(1, "Issuer is required"),
  description: z.string().optional(),
  expirationDate: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Settings Forms
export const profileSettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

export const securitySettingsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Type exports
export type LoginCredentialsForm = z.infer<typeof loginCredentialsSchema>
export type PassphraseLoginForm = z.infer<typeof passphraseLoginSchema>
export type DIDLoginForm = z.infer<typeof didLoginSchema>
export type CredentialForm = z.infer<typeof credentialSchema>
export type ProfileSettingsForm = z.infer<typeof profileSettingsSchema>
export type SecuritySettingsForm = z.infer<typeof securitySettingsSchema>
