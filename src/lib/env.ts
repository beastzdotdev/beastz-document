import z from 'zod';
import { exactStringToBoolean } from '@/lib/utils';

const envSchema = z.object({
  WORKOS_API_KEY: z.string().min(1),
  WORKOS_CLIENT_ID: z.string().min(1),
  WORKOS_REDIRECT_URI: z.string().min(1),
  WORKOS_COOKIE_PASSWORD: z.string().min(1),
  WORKOS_DEBUG: exactStringToBoolean,
});

export const env = envSchema.parse(process.env);
