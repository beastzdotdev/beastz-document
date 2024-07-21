import { ReactCodeMirrorProps } from '@uiw/react-codemirror';

export type EditorTheme = ReactCodeMirrorProps['theme'];
export type PageProps<T> = {
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
};
