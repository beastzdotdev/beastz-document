import z from 'zod';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GeneralEnumType } from '@/lib/types';

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

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const sleep = async (time: number = 1000) => {
  return await new Promise(f => setTimeout(f, time));
};

export function enumValueIncludes<E extends GeneralEnumType<E>>(someEnum: E, value: string) {
  return Object.values(someEnum).includes(value);
}

export const cleanURL = (
  pathName: string,
  params?: Record<string, string | number | boolean>
): URL => {
  const url = new URL(window.location.href);
  url.pathname = pathName;

  const urlSearchParams = new URLSearchParams();

  for (const key in params) {
    urlSearchParams.set(key, params[key].toString());
  }

  url.search = urlSearchParams.toString();

  return url;
};
