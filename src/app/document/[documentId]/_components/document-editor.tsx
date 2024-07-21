'use client';

import * as themes from '@uiw/codemirror-themes-all';
import CodeMirror, { EditorView, Extension, Text } from '@uiw/react-codemirror';
import { useEffect, useMemo, useRef, useState } from 'react';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { bus } from '@/lib/event-bus';
import { copy } from '@/lib/utils';

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

  useEffect(() => {
    bus.subscribe('editor:selectAll', () => {
      editor.current?.view.dispatch({
        selection: { anchor: 0, head: tempText.length },
      });
    });

    bus.subscribe('editor:copy', () => {
      if (!editor.current) {
        return;
      }

      const selection = editor.current.view.state.selection.main;

      if (!selection || selection.empty) {
        //TODO: show appropriate message toast
        return;
      }

      const text = editor.current.view.state.sliceDoc(selection.from, selection.to);
      copy(text);
      console.log(text);
      //TODO: show appropriate message toast
    });
  }, []);

  return (
    <>
      <CodeMirror
        ref={editor}
        value={tempText}
        width="800px"
        className="w-fit mx-auto h-full cm-custom"
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
