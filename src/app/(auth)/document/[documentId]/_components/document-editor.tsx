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
import { copyToClipboard } from '@/lib/utils';
import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import { useSocketStore } from '@/app/(auth)/document/state';
import { useUserStore } from '@/app/(auth)/state';
import {
  getDocumentText,
  getFileStructureById,
  getFileStructurePublicShare,
  getText,
} from '@/lib/api/definitions';
import { useCollabButtonStore } from '@/app/(auth)/document/_components/collab-button.state';
import {
  PeerPlugin,
  peerExtensionCompartment,
} from '@/app/(auth)/document/[documentId]/_components/peer-extensions';

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
  const router = useRouter();
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
      router.push('/404?message=Document not found' as any);
      return;
    }

    const { data: text, error: textError } = await getText(data.absRelativePath);

    if (textError || typeof text !== 'string') {
      toast.error('Sorry, something went wrong');
      return;
    }

    docStore.setDoc(Text.of([text]));
  }, [docStore, params.documentId, router]);

  const isShareEnabled = useCallback(async () => {
    const documentId = parseInt(params.documentId);

    if (typeof documentId !== 'number') {
      toast.error('Sorry, something went wrong');
      return;
    }

    const { data } = await getFileStructurePublicShare(documentId);

    return !!(data && !data.isDisabled);
  }, [params.documentId]);

  const init = useCallback(async () => {
    // first connect socket always
    // connection is always necessary for locks and everything
    docEditSocket.connect();

    const isFsShareEnabled = await isShareEnabled();

    if (!isFsShareEnabled) {
      await setText();
    }

    docStore.setReadonly(false);
  }, [docStore, isShareEnabled, setText]);

  useEffect(
    () => {
      // !!! Important
      //TODO there is some system change create plan
      //TODO for example users connected on frontend must be enabled after for example isShared is true in zustand
      //TODO loading document also must be rechecked because here it is fetched from get go not checked is sharing is enabled or not
      //TODO    and error appears because of that

      //TODO but connection indicator must be global on socket
      init();

      docEditSocket.on('admin_test', payload => {
        console.log('='.repeat(20) + '[ADMIN]');
        console.log(payload);
      });

      docEditSocket.on('fetch_doc', async () => {
        console.log('='.repeat(20));
        console.log(parseInt(params.documentId));

        const { data, error } = await getDocumentText(parseInt(params.documentId));

        console.log('='.repeat(20));
        console.log({ data, error });

        if (error || data === undefined) {
          toast.error('Sorry, could not load document');
          return;
        }

        const userId = userStore.getUser().id;

        view().dispatch({
          effects: peerExtensionCompartment.reconfigure(PeerPlugin(userId, docEditSocket)),
        });

        docStore.setDoc(Text.of([data]));
      });

      docEditSocket.on('connect', async () => {
        console.log('CONNECTEd');
        useSocketStore.getState().setStatus('connected');
      });

      docEditSocket.on('disconnect', async x => {
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
        console.log('RECONNECTED');

        // editor?.current?.view.dispatch({
        //   effects: peerExtensionCompartment.reconfigure([]),
        // });
      });
      docEditSocket.io.on('reconnect_attempt', reconnectNumber => {
        useSocketStore.getState().setStatus('reconnecting');

        // console.log('RECONNECT_ATTEMPT', reconnectNumber);
        // removePeerExtension();
      });

      return () => {
        docEditSocket.io.off('reconnect');
        docEditSocket.io.off('reconnect_attempt');

        docEditSocket.off('connect');
        docEditSocket.off('disconnect');

        docEditSocket.off('fetch_doc');
        docEditSocket.off('admin_test');
        // docEditSocket.off('connect_error');
        // docEditSocket.off('connect_failed');

        // docEditSocket.off('pullUpdateResponse');
        // docEditSocket.off('pushUpdateResponse');
        // docEditSocket.off('getDocumentResponse');
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <>
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
                insert: tempText,
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
