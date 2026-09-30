import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const memberFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  rollNumber: z.string().min(2, 'Roll number is required'),
  teamId: z.enum(['vibe-coding', 'ai', 'marketing', 'industry-connect'], {
    errorMap: () => ({ message: 'Please select a valid team' }),
  }),
});

export type MemberFormData = z.infer<typeof memberFormSchema>;

export const correctionRequestSchema = z.object({
  attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  reason: z.string().min(5, 'Reason must be at least 5 characters long').max(500, 'Reason is too long'),
});

export type CorrectionRequestFormData = z.infer<typeof correctionRequestSchema>;
