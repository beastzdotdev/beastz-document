import z from 'zod';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const exactStringToBoolean = z
  .string()
  .transform(val => (val === 'true' ? true : val === 'false' ? false : null))
  .pipe(z.boolean());

export const exactStringToNumber = z
  .string()
  .transform(v => parseInt(v))
  .pipe(z.number());
