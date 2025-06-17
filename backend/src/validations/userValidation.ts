import { z } from 'zod';

export const userValidation = {
  updateProfile: z.object({
    body: z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      phone: z.string().optional(),
      avatar: z.string().url().optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        emailNotifications: z.boolean().optional(),
        jobAlerts: z.boolean().optional(),
      }).optional(),
    }),
  }),

  updateUser: z.object({
    body: z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      phone: z.string().optional(),
      avatar: z.string().url().optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        emailNotifications: z.boolean().optional(),
        jobAlerts: z.boolean().optional(),
      }).optional(),
      // Remove role validation
    }),
  }),
};
