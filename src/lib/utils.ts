import z from 'zod';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GeneralEnumType } from '@/lib/types';
import { FileStructure } from '@/lib/api/type';
import { FileMimeType } from '@/lib/enums/file-mimte-type.enum';
import { constants } from '@/lib/constants';
import { UrlObject } from 'url';

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

export const formatDate = (date: Date): string => {
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();

  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const time = date.toLocaleTimeString([], options);

  if (isToday) {
    return `Opened ${time}`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    return `Opened ${formattedDate}`;
  }
};

export const getRedirectUrl = (item: FileStructure): UrlObject => {
  const ext = item.mimeType === FileMimeType.TEXT_PLAIN ? '.txt' : '.md';

  const queryParams = new URLSearchParams({
    [constants.general.queryTitleForDocument]: item.title + ext,
  });

  return `/document/${item.id}?${queryParams.toString()}` as unknown as UrlObject;
};
