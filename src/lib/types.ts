import { ExceptionMessageCode } from '@/lib/enums/exception-message-code.enum';
import { ReactCodeMirrorProps } from '@uiw/react-codemirror';

export type EditorTheme = ReactCodeMirrorProps['theme'];
export type PageProps<T> = {
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
};

export type ReactChildren = Readonly<{ children: React.ReactNode }>;
export type ReactPropsWithChildren<T> = Readonly<T & { children: React.ReactNode }>;

export type Combine<T, U> = T & U;
export type Pagination<T> = {
  data: T[];
  total: number;
};
export type BasicMessageResponse<T = string> = {
  message: T;
};
export type GeneralClass<T = unknown> = {
  new (...args: never[]): T;
};
export type MappedRecord<T> = {
  [key in keyof T]: T[key];
};
export type BusPayload<T = unknown> = {
  message: string;
  data?: T;
  uuid?: string;
};

export class SocketError extends Error {
  message: ExceptionMessageCode | string;
  data?: { description?: string };
}

export type GeneralEnumType<E> = Record<keyof E, number | string> & { [k: number]: string };
