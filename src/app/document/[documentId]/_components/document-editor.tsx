'use client';

import * as themes from '@uiw/codemirror-themes-all';

import CodeMirror, { EditorView, Extension, Text } from '@uiw/react-codemirror';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme, SocketError } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { copyToClipboard, enumValueIncludes } from '@/lib/utils';
import { bus } from '@/lib/bus';
import { toast } from 'sonner';
import { Icon } from '@iconify/react/dist/iconify.js';
import {
  getDocument,
  peerExtension,
  peerExtensionCompartment,
} from '@/app/document/[documentId]/_components/peer-extensions';
import { docEditSocket } from '@/app/document/[documentId]/_components/socket';
import { ExceptionMessageCode } from '@/lib/enums/exception-message-code.enum';

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
      toast.warning('Nothing was selected');
      return;
    }

    const text = editor.current.view.state.sliceDoc(selection.from, selection.to);
    copyToClipboard(text);

    toast.success('Copied to clipboard');
    return;
  }, []);

  useEffect(() => {
    bus.on('editor:select-all', selectAll);
    bus.on('editor:copy', copySelected);
  }, [copySelected, selectAll]);

  useEffect(() => {
    //TODO health check for refresh token rotation or anything before connecting to socket
    docEditSocket.on('connect', async () => {
      bus.emit('socket:connected');

      // get latest doc version
      const { version, doc } = await getDocument(docEditSocket);
      setVersion(version);
      setDoc(doc);
    });
    docEditSocket.on('disconnect', () => {
      console.log('DISCONNECTED');
      console.log(reason); // prints "io client disconnect"
    });
    docEditSocket.on('error', (err: Error) => {
      console.log('ERROR');
      console.log(error);
    });
    docEditSocket.on('connect_error', (err: SocketError) => {
      console.log('CONNECT_ERROR');
      console.dir(err);

      if (!err?.message) {
        toast.warning('Something went wrong, please try again');
        return;
      }

      if (enumValueIncludes(ExceptionMessageCode, err.message)) {
        toast.warning(err.message); //TODO: appropriate messages
        return;
      }

      toast.warning('Something went wrong, please try again');
    });
    docEditSocket.on('connect_failed', (err: Error) => {
      console.log('='.repeat(20) + 'connect_failed');
      console.log(err);
    });

    return () => {
      docEditSocket.off('connect');
      docEditSocket.off('disconnect');

      docEditSocket.off('error');
      docEditSocket.off('connect_error');
      docEditSocket.off('connect_failed');

      docEditSocket.off('pullUpdateResponse');
      docEditSocket.off('pushUpdateResponse');
      docEditSocket.off('getDocumentResponse');
    };
  }, []);

  //! This is how to activate extension without rerendering component
  useEffect(() => {
    if (!editor.current?.view) {
      return;
    }

    console.log(123);

    if (version !== undefined) {
      console.log(321);
      console.log('Registering once peer extension');
      console.log('='.repeat(40));

      editor.current.view.dispatch({
        effects: peerExtensionCompartment.reconfigure(peerExtension(docEditSocket, version)),
      });
    }
  }, [version]);

  return (
    <>
      <CodeMirror
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
