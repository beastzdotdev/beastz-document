'use client';

import * as themes from '@uiw/codemirror-themes-all';
import CodeMirror, { EditorView, Extension, Text } from '@uiw/react-codemirror';
import { create } from 'zustand';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { bus } from '@/lib/bus';
import { Button } from '@/components/ui/button';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme, SocketError } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { copyToClipboard } from '@/lib/utils';
import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import { useSocketStore } from '@/app/(auth)/document/state';
import { useUserStore } from '@/app/(auth)/state';
import { getFileStructureById, getText } from '@/lib/api/definitions';
import {
  PeerPlugin,
  getDocument,
  peerExtensionCompartment,
} from '@/app/(auth)/document/[documentId]/_components/peer-extensions';
import { useCollabButtonStore } from '@/app/(auth)/document/_components/collab-button.state';

const tempText = Text.of([
  'Hello',
  'World',
  'Hello'.repeat(10),
  ...Array.from({ length: 100 }, (_, i) => `Test ${i}`),
]).toString();

type SocktState = {
  doc: Text | undefined;
  readonly: boolean;
  setDoc: (value: Text) => void;
  setReadonly: (value: boolean) => void;
  setAll: (params: { value: Text; readonly: boolean }) => void;
};

export const useDocStore = create<SocktState>((set, get) => ({
  doc: undefined,
  readonly: true,
  setDoc: (value: Text) => set({ doc: value }),
  setReadonly: (value: boolean) => set({ readonly: value }),
  setAll: ({ value, readonly }) => set({ doc: value, readonly }),
}));

/**
 * @important
 * ! state given from useRef is only initial state
 * ! if you want to access state current from codemirror 6 then access it view editor.view.state
 */
export const DocumentEditor = (): JSX.Element => {
  const socketStore = useSocketStore();
  const docStore = useDocStore();
  const userStore = useUserStore();
  const params = useParams<{ documentId: string }>();

  const editorRef = useRef<{ view: EditorView }>(null);
  const [theme, _setTheme] = useState<EditorTheme>('dark');

  const view = useCallback(() => {
    if (!editorRef.current) {
      throw new Error('Editor not found');
    }

    return editorRef.current.view;
  }, []);

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
    view().dispatch({
      selection: { anchor: 0, head: view().state.doc.toString().length },
    });

    // focus after selecting all from menubar
    view().focus();
  }, [view]);

  const copySelected = useCallback(() => {
    const selection = view().state.selection.main;

    if (!selection || selection.empty) {
      toast.warning('Nothing was selected');
      return;
    }

    const text = view().state.sliceDoc(selection.from, selection.to);
    copyToClipboard(text);

    toast.success('Copied to clipboard');
    return;
  }, [view]);

  useEffect(() => {
    bus.on('editor:select-all', selectAll);
    bus.on('editor:copy', copySelected);
  }, [copySelected, selectAll]);

  const setText = useCallback(async () => {
    const documentId = parseInt(params.documentId);

    if (typeof documentId !== 'number') {
      toast.error('Sorry, something went wrong');
      return;
    }

    const { data, error } = await getFileStructureById(documentId);

    if (error || !data || !data.absRelativePath) {
      toast.error('Sorry, something went wrong');
      return;
    }

    const { data: text, error: textError } = await getText(data.absRelativePath);

    if (textError || !text) {
      toast.error('Sorry, something went wrong');
      return;
    }

    docStore.setAll({
      value: Text.of([text]),
      readonly: false,
    });
  }, [docStore, params.documentId]);

  useEffect(
    () => {
      setText();

      //TODO: also all connected users must not be authenticated user
      //! connect socket here !!!

      // const onClick = useCallback(async () => {
      //   if (docEditSocket.connected) {
      //     return;
      //   }

      //   setLoading(true);

      //   const { error } = await secureHealthCheck();
      //   if (error) {
      //     return;
      //   }

      //   // health check before connecting to socket
      //   docEditSocket.connect();
      // }, []);

      docEditSocket.on('connect', async () => {
        useSocketStore.getState().setStatus('connected');

        // get latest doc version
        const doc = await getDocument(docEditSocket);
        docStore.setDoc(doc);

        const userId = userStore.getUser().id;

        view().dispatch({
          effects: peerExtensionCompartment.reconfigure(PeerPlugin(userId, docEditSocket)),
        });
      });

      docEditSocket.on('disconnect', async () => {
        useSocketStore.getState().setStatus('disconnected');
      });

      docEditSocket.on('connect_error', (err: SocketError) => {
        console.log('='.repeat(20));
        console.log(err);
        // if (!err?.message) {
        //   toast.warning('Something went wrong, please try again');
        // } else if (enumValueIncludes(ExceptionMessageCode, err.message)) {
        //   toast.warning(err.message); //TODO: appropriate messages
        // } else {
        //   toast.warning('Something went wrong, please try again');
        // }

        // bus.emit('socket:disconnected');
      });

      // docEditSocket.on('connect_failed', () => {
      //   toast.warning('Something went wrong, please try again');
      //   bus.emit('socket:disconnected');
      // });

      docEditSocket.io.on('error', () => {
        console.log('='.repeat(20) + 1);
      });
      docEditSocket.on('error', err => {
        console.log('='.repeat(20) + 2);
        console.log(err);
      });

      docEditSocket.io.on('reconnect', attempt => {
        // editor?.current?.view.dispatch({
        //   effects: peerExtensionCompartment.reconfigure([]),
        // });
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

  const x = useCollabButtonStore();

  return (
    <>
      <>
        <p>readonly: {!!docStore.readonly ? 'yes' : 'no'}</p>
        <p>sock status: {socketStore.status}</p>
        <Button
          onClick={() => {
            // insert new text at the end of line
            view().dispatch({
              changes: {
                from: view().state.doc.toString().length,
                insert: tempText,
              },
            });
          }}
        >
          instert big text
        </Button>
        <Button onClick={() => selectAll()}>test</Button>
        {/* <Button onClick={() => docEditSocket.emit('test')}>test</Button> */}
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
        ref={editorRef}
        value={docStore.doc?.toString()}
        width="1050px"
        className="w-fit mx-auto h-full cm-custom"
        autoFocus
        spellCheck
        editable={!docStore.readonly}
        readOnly={docStore.readonly}
        basicSetup={{
          ...docConfigBundle.basicSetupOption,
          lineNumbers: false,
          highlightActiveLine: !docStore.readonly,
          highlightActiveLineGutter: !docStore.readonly,
        }}
        extensions={extensions}
        theme={activeTheme}
      />
    </>
  );
};
