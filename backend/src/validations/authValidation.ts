import { z } from 'zod';

export const authValidation = {
  register: z.object({
    body: z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email(),
      password: z.string().min(6),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
};
