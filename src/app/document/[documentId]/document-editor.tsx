'use client';

import * as themes from '@uiw/codemirror-themes-all';
import CodeMirror, { EditorView, Extension, Text } from '@uiw/react-codemirror';
import { useMemo, useRef, useState } from 'react';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';

// const tempText = Text.of(['Hello'.repeat(10), 'Hello'.repeat(10)]).toString();
export const tempText = Text.of([
  'Hello',
  'World',
  'Hello'.repeat(10),
  ...Array.from({ length: 100 }, (_, i) => `Test ${i}`),
]).toString();

export const DocumentEditor = (): JSX.Element => {
  const [theme, _setTheme] = useState<EditorTheme>('dark');
  const editor = useRef<{ view: EditorView }>(null);
  const extensions: Extension[] = useMemo(
    () => docConfigBundle.getAllExtension().concat(markdown({ codeLanguages: languages })),
    []
  );
  const activeTheme = useMemo(
    () => (themes[theme as keyof typeof themes] || theme) as EditorTheme,
    [theme]
  );

  return (
    <>
      <CodeMirror
        ref={editor}
        value={tempText}
        width="800px"
        className="w-fit mx-auto h-full"
        autoFocus
        spellCheck
        readOnly={false}
        basicSetup={docConfigBundle.basicSetupOption}
        extensions={extensions}
        theme={activeTheme}
      />
    </>
  );
};
