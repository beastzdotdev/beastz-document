'use client';

import * as themes from '@uiw/codemirror-themes-all';

import CodeMirror, { EditorView, Extension, Text } from '@uiw/react-codemirror';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { copyToClipboard } from '@/lib/utils';
import { bus } from '@/lib/bus';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react/dist/iconify.js';

export const tempText = Text.of([
  'Hello',
  'World',
  'Hello'.repeat(10),
  ...Array.from({ length: 100 }, (_, i) => `Test ${i}`),
]).toString();

export const DocumentEditor = (): JSX.Element => {
  console.log('rerender');

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

  const selectAll = useCallback(() => {
    editor.current?.view.dispatch({
      selection: { anchor: 0, head: tempText.length },
    });
  }, []);

  const copySelected = useCallback(() => {
    if (!editor.current) {
      return;
    }

    const selection = editor.current.view.state.selection.main;

    if (!selection || selection.empty) {
      toast.warning('Nothing was selected', { position: 'top-right' });
      return;
    }

    const text = editor.current.view.state.sliceDoc(selection.from, selection.to);
    copyToClipboard(text);

    toast.success('Copied to clipboard', {
      position: 'top-right',
      duration: 3000,
      cancel: {
        label: <Icon icon="ic:round-close" fontSize={18} />,
        onClick: () => {},
      },
    });
  }, []);

  useEffect(() => {
    bus.on('editor:select-all', selectAll);
    bus.on('editor:copy', copySelected);
  }, [copySelected, selectAll]);

  // useEffect(() => {
  //   async function onConnect() {
  //     setIsConnected(true);
  //     setTransport(socket.io.engine.transport.name);

  //     socket.io.engine.on('upgrade', transport => {
  //       setTransport(transport.name);
  //     });

  //     const { version, doc } = await getDocument(socket);

  //     setVersion(version);
  //     setDoc(doc);
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //     setTransport('N/A');
  //   }

  //   ///======================
  //   if (socket.connected) {
  //     onConnect();
  //   }

  //   socket.on('connect', onConnect);
  //   socket.on('disconnect', onDisconnect);

  //   return () => {
  //     socket.off('connect');
  //     socket.off('disconnect');
  //     socket.off('pullUpdateResponse');
  //     socket.off('pushUpdateResponse');
  //     socket.off('getDocumentResponse');
  //   };
  // }, []);

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
