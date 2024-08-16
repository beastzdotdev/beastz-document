```tsx
'use client';

import * as themes from '@uiw/codemirror-themes-all';
import { create } from 'zustand';
import { toast } from 'sonner';
import CodeMirror, { EditorView, Extension, Text } from '@uiw/react-codemirror';

import { bus } from '@/lib/bus';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { copyToClipboard } from '@/lib/utils';
import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import { useSocketStore } from '@/app/(auth)/document/state';
import {
  getDocument,
  peerExtension,
  peerExtensionCompartment,
} from '@/app/(auth)/document/[documentId]/_components/peer-extensions';

export const tempText = Text.of([
  'Hello',
  'World',
  'Hello'.repeat(10),
  ...Array.from({ length: 100 }, (_, i) => `Test ${i}`),
]).toString();

type SocktState = {
  doc: string | undefined;
  version: number | undefined;
  setDoc: (value: string) => void;
  setVersion: (value: number) => void;
  setAll: (value: { doc: string; version: number }) => void;
};

export const useDocStore = create<SocktState>((set, get) => ({
  doc: undefined,
  version: undefined,
  setDoc: (value: string) => set({ doc: value }),
  setVersion: (value: number) => set({ version: value }),
  setAll: (value: { doc: string; version: number }) => set({ ...value }),
}));

export const DocumentEditor = (): JSX.Element => {
  const socketStore = useSocketStore();
  const docStore = useDocStore();

  const [theme, _setTheme] = useState<EditorTheme>('dark');
  const editor = useRef<{ view: EditorView }>(null);

  // const [version, setVersion] = useState<number>();
  // const [doc, setDoc] = useState<Text>();

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

  // console.log('RERENDER WHOLE EDITOR');

  useEffect(
    () => {
      docEditSocket.on('connect', async () => {
        if (!editor.current?.view) {
          return;
        }

        useSocketStore.getState().setStatus('connected');

        // get latest doc version
        const { version, doc } = await getDocument(docEditSocket);
        docStore.setAll({ doc: doc.toString(), version });

        await new Promise(f => setTimeout(f, 1000));

        editor.current.view.dispatch({
          effects: peerExtensionCompartment.reconfigure(peerExtension(docEditSocket, version)),
        });
      });

      docEditSocket.on('disconnect', async () => {
        if (!editor.current?.view) {
          return;
        }

        useSocketStore.getState().setStatus('disconnected');
      });

      // docEditSocket.on('connect_error', (err: SocketError) => {
      //   if (!err?.message) {
      //     toast.warning('Something went wrong, please try again');
      //   } else if (enumValueIncludes(ExceptionMessageCode, err.message)) {
      //     toast.warning(err.message); //TODO: appropriate messages
      //   } else {
      //     toast.warning('Something went wrong, please try again');
      //   }

      //   bus.emit('socket:disconnected');
      // });

      // docEditSocket.on('connect_failed', () => {
      //   toast.warning('Something went wrong, please try again');
      //   bus.emit('socket:disconnected');
      // });

      docEditSocket.io.on('reconnect', attempt => {
        editor?.current?.view.dispatch({
          effects: peerExtensionCompartment.reconfigure([]),
        });

        // console.log('RECONNECTED');
      });
      docEditSocket.io.on('reconnect_attempt', reconnectNumber => {
        // console.log('RECONNECT_ATTEMPT', reconnectNumber);
        // removePeerExtension();
        useSocketStore.getState().setStatus('reconnecting');
      });

      // docEditSocket.io.on('close', e => {
      //   console.log('CLOSED', e);
      // });
      // docEditSocket.io.on('error', e => {
      //   console.log('ERROR', e);
      // });
      // docEditSocket.io.on('open', () => {
      //   console.log('OPEN');
      // });
      // docEditSocket.io.on('packet', e => {
      //   console.log('PACKET', e);
      // });
      // docEditSocket.io.on('ping', () => {
      //   console.log('PING');
      // });

      // docEditSocket.io.on('reconnect_error', e => {
      //   console.log('RECONNECT_ERROR', e);
      // });
      // docEditSocket.io.on('reconnect_failed', () => {
      //   console.log('RECONNECT_FAILED');
      // });

      return () => {
        docEditSocket.io.off('reconnect');
        docEditSocket.io.off('reconnect_attempt');

        docEditSocket.off('connect');
        docEditSocket.off('disconnect');

        // docEditSocket.off('connect_error');
        // docEditSocket.off('connect_failed');

        // docEditSocket.off('pullUpdateResponse');
        // docEditSocket.off('pushUpdateResponse');
        // docEditSocket.off('getDocumentResponse');
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <>
        <p>sock status: {socketStore.status}</p>
        <p>version: {docStore.version}</p>
        <p>doc: {docStore.doc}</p>
        <Button
          onClick={() => {
            if (!editor.current?.view) {
              return;
            }

            console.log(peerExtensionCompartment.get(editor.current.view.state));
          }}
        >
          log exts
        </Button>
        <Button onClick={() => docEditSocket.emit('test')}>test</Button>
        <Button onClick={() => docEditSocket.disconnect()}>disconnect</Button>
        <Button onClick={() => docEditSocket.io.engine.close()}>low-level diconnect</Button>
        <Button
          onClick={() => {
            bus.emit('open:global-model', {
              type: 'notification',
              message: 'this is message',
              title: 'this is ttitle',
              onClose: () => {
                console.log(123);
              },
            });
          }}
        >
          test (open:global-model)
        </Button>
      </>

      <CodeMirror
        ref={editor}
        value={docStore.doc}
        width="1050px"
        className="w-fit mx-auto h-full cm-custom"
        autoFocus
        spellCheck
        readOnly={socketStore.status === 'reconnecting'}
        basicSetup={{ ...docConfigBundle.basicSetupOption, lineNumbers: false }}
        extensions={extensions}
        theme={activeTheme}
      />
    </>
  );
};
```