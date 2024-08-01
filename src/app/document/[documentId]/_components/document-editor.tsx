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
import { Icon } from '@iconify/react/dist/iconify.js';
import { socket } from '@/app/socket';
import {
  getDocument,
  peerExtension,
  peerExtensionCompartment,
} from '@/app/document/[documentId]/_components/peer-extensions';

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

  const [version, setVersion] = useState<number>();
  const [doc, setDoc] = useState<Text>();

  const extensions: Extension[] = useMemo(
    () =>
      docConfigBundle
        .getAllExtension()
        .concat(markdown({ codeLanguages: languages }), peerExtensionCompartment.of([])),
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

  useEffect(() => {
    socket.on('connect', async () => {
      const { version, doc } = await getDocument(socket);

      setVersion(version);
      setDoc(doc);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pullUpdateResponse');
      socket.off('pushUpdateResponse');
      socket.off('getDocumentResponse');
    };
  }, []);

  //! This is how to activate extension without rerendering component
  useEffect(() => {
    if (!editor.current?.view) {
      return;
    }

    if (version !== undefined) {
      console.log('Registering once peer extension');
      console.log('='.repeat(40));

      editor.current.view.dispatch({
        effects: peerExtensionCompartment.reconfigure(peerExtension(socket, version)),
      });
    }
  }, [version]);

  return (
    <>
      <CodeMirror
        id="123-xx"
        ref={editor}
        value={doc?.toString()}
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
