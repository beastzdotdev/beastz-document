'use client';

import * as themes from '@uiw/codemirror-themes-all';
import CodeMirror, { EditorView, Extension, Text } from '@uiw/react-codemirror';
import { create } from 'zustand';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { bus } from '@/lib/bus';
import { Button } from '@/components/ui/button';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme, SocketError } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { cleanURL, copyToClipboard } from '@/lib/utils';
import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import { getDocumentText, getText } from '@/lib/api/definitions';
import {
  PeerPlugin,
  peerExtensionCompartment,
} from '@/app/(auth)/document/[documentId]/_components/peer-extensions';
import { constants } from '@/lib/constants';
import {
  useDocStore,
  useDocumentShareStore,
  useDocumentStore,
  useSocketStore,
} from '@/app/(auth)/document/[documentId]/state';
import { useUserStore } from '@/app/(auth)/state';

/**
 * @important
 * ! state given from useRef is only initial state
 * ! if you want to access state current from codemirror 6 then access it view editor.view.state
 */
export const DocumentEditor = (): JSX.Element => {
  const router = useRouter();
  const socketStore = useSocketStore();
  const docStore = useDocStore();
  const documentStore = useDocumentStore();
  const documentShareStore = useDocumentShareStore();
  const params = useParams<{ documentId: string }>();
  const user = useUserStore();

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
    [],
  );

  const activeTheme = useMemo(
    () => (themes[theme as keyof typeof themes] || theme) as EditorTheme,
    [theme],
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

  const setText = async (text: string) => {
    docStore.setDoc(Text.of([text]));

    // make editor writable
    docStore.setReadonly(false);
  };

  useEffect(() => {
    bus.on('editor:select-all', selectAll);
    bus.on('editor:copy', copySelected);
  }, [copySelected, selectAll]);

  useEffect(() => {
    const view = editorRef?.current?.view;

    if (!view) {
      return;
    }

    const plugin = documentShareStore.isEnabled
      ? PeerPlugin(
          user.getUser().id,
          docEditSocket,
          documentStore.getDocumentStrict().sharedUniqueHash,
        )
      : [];

    view.dispatch({
      effects: peerExtensionCompartment.reconfigure(plugin),
    });
  }, [documentShareStore.isEnabled, user, editorRef.current?.view, documentStore]);

  useEffect(
    () => {
      (async () => {
        console.log('='.repeat(20));
        console.log('is enabled', documentShareStore.isEnabled);

        if (!documentShareStore.isEnabled) {
          const { data: text, error: textError } = await getText(
            documentStore.getDocumentStrict().absRelativePath!,
          );

          if (textError || typeof text !== 'string') {
            router.push(
              cleanURL(constants.path.oops, { message: 'Something went wrong' }).toString(),
            );
            return;
          }

          setText(text);
        }

        // connect socket
        docEditSocket.connect();
      })();

      docEditSocket.on('connect', async () => {
        console.log('CONNECTEd');
        useSocketStore.getState().setStatus('connected');
      });

      docEditSocket.on('disconnect', () => {
        console.log('CONNECTEd');
        useSocketStore.getState().setStatus('disconnected');
      });

      docEditSocket.on('error', (err: SocketError) => {
        console.log('Socket error', err);
      });

      docEditSocket.io.on('reconnect_attempt', reconnectNumber => {
        console.log('RECONNECT_ATTEMPT', reconnectNumber);
        useSocketStore.getState().setStatus('reconnecting');
      });

      docEditSocket.io.on('reconnect_failed', () => {
        toast.warning('Sorry reconnection failed, click connection indicator to try reconnecting', {
          duration: 10000,
        });

        useSocketStore.getState().setStatus('disconnected');
      });

      // User defined events
      docEditSocket.on(constants.socket.events.PullDocFull, async () => {
        const { data: text, error } = await getDocumentText(parseInt(params.documentId));

        if (error || text === undefined) {
          toast.error('Sorry, could not load document');
          return;
        }

        setText(text);
      });

      return () => {
        // native events
        docEditSocket.off('connect');
        docEditSocket.off('disconnect');
        docEditSocket.off('error');

        docEditSocket.io.off('reconnect_attempt');
        docEditSocket.io.off('reconnect_failed');

        docEditSocket.off(constants.socket.events.PullDocFull);

        docEditSocket.disconnect();

        socketStore.clear();
        docStore.clear();
        documentStore.clear();
        documentShareStore.clear();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      {/* <>
        <p>readonly: {!!docStore.readonly ? 'yes' : 'no'}</p>
        <div className="flex">
          <p>sock status: {socketStore.status} </p>
          {socketStore.status === 'connected' ? (
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
          ) : (
            <div className="w-5 h-5 bg-red-500 rounded-full"></div>
          )}
        </div>

        <Button
          onClick={async () => {
            const result = await getDocumentText(parseInt(params.documentId));
            console.log('='.repeat(20));
            console.log(result);
          }}
        >
          test x
        </Button>
        <Button
          onClick={() => {
            // insert new text at the end of line
            view().dispatch({
              changes: {
                from: view().state.doc.toString().length,
                insert: Text.of([
                  'Hello',
                  'World',
                  'Hello'.repeat(10),
                  ...Array.from({ length: 100 }, (_, i) => `Test ${i}`),
                ]).toString(),
              },
            });
          }}
        >
          instert big text
        </Button>
        <Button onClick={() => selectAll()}>select all</Button>
        <Button
          onClick={() => {
            docEditSocket.connect();
          }}
        >
          connect
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
      </> */}

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
