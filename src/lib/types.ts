import { ReactCodeMirrorProps } from '@uiw/react-codemirror';

export type EditorTheme = ReactCodeMirrorProps['theme'];
export type PageProps<T> = {
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
};

export type ReactChildren = Readonly<{ children: React.ReactNode }>;
export type ReactPropsWithChildren<T> = Readonly<T & { children: React.ReactNode }>;
