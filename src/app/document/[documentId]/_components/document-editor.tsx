'use client';

import * as themes from '@uiw/codemirror-themes-all';
import domtoimage from 'dom-to-image';
import CodeMirror, { EditorView, Extension, Text } from '@uiw/react-codemirror';
import { useEffect, useMemo, useRef, useState } from 'react';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { bus } from '@/lib/event-bus';
import { copy } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  //TODO: this is for images of documents in /home
  //TODO: image must be collected asynchronously
  const _DOMTOIMAGE = () => {
    console.time('domtoimage');
    const node = document.getElementById('123-xx');

    domtoimage
      .toJpeg(node!, { height: 400, quality: 1 })
      .then(function (dataUrl: string) {
        var link = document.createElement('a');
        link.download = 'domtoimage.jpeg';
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error: unknown) {
        console.error('oops, something went wrong!', error);
      })
      .finally(() => {
        console.timeEnd('domtoimage');
      });
  };

  return (
    <>
      <CodeMirror
        id="123-xx"
        ref={editor}
        value={tempText}
        width="1050px"
        className="w-fit mx-auto h-full cm-custom"
        autoFocus
        spellCheck
        readOnly={false}
        basicSetup={{ ...docConfigBundle.basicSetupOption, lineNumbers: false }}
        extensions={extensions}
        theme={activeTheme}
      />
    </>
  );
};
