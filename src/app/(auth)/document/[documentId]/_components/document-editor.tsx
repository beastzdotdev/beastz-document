'use client';

import * as themes from '@uiw/codemirror-themes-all';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror, { ChangeSet, EditorView, Extension, Rect, Text } from '@uiw/react-codemirror';

import { bus } from '@/lib/bus';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorTheme, SocketError } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { copyToClipboard, sleep } from '@/lib/utils';
import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import {
  getCollabActiveParticipantsPublic,
  getDocumentText,
  replaceFileStructureText,
} from '@/lib/api/definitions';
import { constants } from '@/lib/constants';
import {
  useDocStore,
  useDocumentShareStore,
  useDocumentStore,
  useJoinedPeopleStore,
  useSocketStore,
} from '@/app/(auth)/document/[documentId]/state';
import { Button } from '@/components/ui/button';

type CursorData = {
  color: string;
  text: string;
  id: string;
  pos: number;
};

const arrOfCursors: CursorData[] = [
  { color: '#009c2f', text: 'Gela', id: crypto.randomUUID(), pos: 12 },
  { color: '#009c2f', text: 'Gelaasdasdasdasd', id: crypto.randomUUID(), pos: 78 },
];

const DEFAULT_PADDING = 30; // can be modified
const IMPORTANT_SIDE = -1;

/**
 * @important
 * ! state given from useRef is only initial state
 * ! if you want to access state current from codemirror 6 then access it view editor.view.state
 */
export const DocumentEditor = (): JSX.Element => {
  const [theme, _setTheme] = useState<EditorTheme>('dark');

  const params = useParams<{ documentId: string }>();
  const editorRef = useRef<{ view: EditorView }>(null);

  const textDiffFromBeforeSave = useRef(false);
  const isInitPullDocFull = useRef(true);

  const socketStore = useSocketStore();
  const docStore = useDocStore();
  const documentStore = useDocumentStore();
  const documentShareStore = useDocumentShareStore();
  const joinedPeopleStore = useJoinedPeopleStore();

  const extensions: Extension[] = useMemo(
    () => docConfigBundle.getAllExtension().concat(markdown({ codeLanguages: languages })),
    [],
  );

  const activeTheme = useMemo(
    () => (themes[theme as keyof typeof themes] || theme) as EditorTheme,
    [theme],
  );

  const view = useCallback(
    () => {
      if (!editorRef.current) {
        throw new Error('Editor not found');
      }

      return editorRef.current.view;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorRef.current?.view],
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

  const handleSaveBeforeShare = async (): Promise<boolean> => {
    if (textDiffFromBeforeSave.current) {
      const newText = view().state.doc.toString();

      const { error } = await replaceFileStructureText(params.documentId, {
        text: newText,
        checkEditMode: false,
      });

      if (error) {
        toast.warning('Something went wrong, please try again');
        return false;
      }

      // update is important for init doc is in new state
      docStore.setInitDoc(Text.of([newText]));
      textDiffFromBeforeSave.current = false;
      document.title = document.title.replace(constants.general.tabEditModePrefix, '');
    }

    return true;
  };

  const handleKeyDownGlobally = async (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      e.stopPropagation();

      if (documentShareStore.isEnabled) {
        return;
      }

      await handleSaveBeforeShare();
    }
  };

  const calculateCords = useCallback(
    (props: { characterPosition: number; editorDom: Element; contentDom: Element }) => {
      const { characterPosition, editorDom, contentDom } = props;

      // Get coordinates for left position calculation, this gives positions for
      const cords = view().coordsAtPos(characterPosition, IMPORTANT_SIDE) as Rect;

      const defaultLineHeight = Math.round(view().defaultLineHeight as number);

      // How much is root editor dom from left and top (that is why we substract from cords.left and cords.top)
      // ContentDom is necessary because hovering vertically is enabled and dom may get out of bounds
      const currentLineAbsPosFromEditorLeft = cords.left - editorDom.getBoundingClientRect().left;
      const currentLineAbsPosFromEditorTop =
        cords.top - contentDom.getBoundingClientRect().top + DEFAULT_PADDING;

      return {
        left: currentLineAbsPosFromEditorLeft,
        top: currentLineAbsPosFromEditorTop,
        lineHeight: defaultLineHeight,
      };
    },
    [view],
  );

  const renderCursor = useCallback(
    (props: { left: number; top: number; lineHeight: number } & CursorData) => {
      const { left, lineHeight, color, text, id, top } = props;

      const span = document.createElement('span');
      span.className = 'cm-x-cursor-line';
      span.style.left = `${left}px`;
      span.style.top = `${top}px`;
      span.style.borderLeft = `1px solid ${color}`;
      span.style.borderRight = `1px solid ${color}`;
      span.style.height = lineHeight + 'px';
      span.id = id;

      const dot = document.createElement('div');
      dot.className = 'cm-x-cursor-head';
      dot.style.backgroundColor = color;
      span.appendChild(dot);

      const nameContainer = document.createElement('div');
      nameContainer.className = 'cm-x-cursor-name-container';
      nameContainer.style.backgroundColor = color;
      nameContainer.textContent = text;
      span.appendChild(nameContainer);

      //! Must be scroller in order for positions to work accordingly if for example you use in
      //! cm-editor instead of cm-scroller then cursor div will not respect scrolling and stay in one place fixed on screen
      document.querySelector('.cm-scroller')?.appendChild(span);
    },
    [],
  );

  useEffect(() => {
    bus.on('editor:select-all', selectAll);
    bus.on('editor:copy', copySelected);
  }, [copySelected, selectAll]);

  useEffect(
    () => {
      window.addEventListener('keydown', handleKeyDownGlobally);
      window.addEventListener('beforeunload', e => {
        if (textDiffFromBeforeSave.current) {
          e.preventDefault();
        }
      });
      bus.on('document:save-before-share', async () => {
        bus.emit('document:save-before-share:response', await handleSaveBeforeShare());
      });

      if (!docEditSocket.connected) {
        docEditSocket.connect();
      }

      docEditSocket.on('connect', async () => {
        useSocketStore.getState().setStatus('connected');
      });

      docEditSocket.on('disconnect', () => {
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

        if (isInitPullDocFull.current) {
          docStore.setInitDoc(Text.of([text])); // this only works on init
        } else {
          // replace all with new text
          view().dispatch({
            changes: {
              from: 0,
              to: view().state.doc.length,
              insert: text,
            },
          });
        }
        // disable initial
        isInitPullDocFull.current = false;

        // loading state for modal button and also readonly state for editor will be resolved in socket event response
        docStore.setReadonly(false);
        documentShareStore.setIsLoading(false);

        const fsId = parseInt(window.location.pathname.split('/').pop() ?? '');
        if (typeof fsId !== 'number') {
          throw new Error('Something went wrong');
        }

        const { data, error: err } = await getCollabActiveParticipantsPublic(fsId);

        if (err || !data) {
          return;
        }

        // here socket id is known
        joinedPeopleStore.setPeople(data.filter(e => e !== docEditSocket.id));
      });

      docEditSocket.on(constants.socket.events.RetryConnection, async () => {
        docEditSocket.disconnect();
        await sleep(1000);
        docEditSocket.connect();
      });

      docEditSocket.on(constants.socket.events.PullDoc, (data: unknown) => {
        view().dispatch({
          scrollIntoView: false,
          changes: ChangeSet.fromJSON(data),
        });
      });

      docEditSocket.on(constants.socket.events.UserJoined, (data: { socketId: string }) => {
        const newData = joinedPeopleStore.people
          .concat(data.socketId)
          .filter(e => e !== docEditSocket.id);
        joinedPeopleStore.setPeople(newData);
      });

      docEditSocket.on(constants.socket.events.UserLeft, (data: { socketId: string }) => {
        joinedPeopleStore.setPeople(joinedPeopleStore.people.filter(e => e !== data.socketId));
      });

      return () => {
        window.removeEventListener('keydown', handleKeyDownGlobally);

        // native events
        docEditSocket.off('connect');
        docEditSocket.off('disconnect');
        docEditSocket.off('error');

        docEditSocket.io.off('reconnect_attempt');
        docEditSocket.io.off('reconnect_failed');

        for (const event of Object.values(constants.socket.events)) {
          docEditSocket.off(event);
        }

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
      <Button
        className="fixed top-10 right-5"
        onClick={() => {
          const cursor = arrOfCursors[0];
          const { left, lineHeight, top } = calculateCords({
            characterPosition: 5,
            editorDom: document.querySelector('.cm-editor')!,
            contentDom: document.querySelector('.cm-content')!,
          });

          document.getElementById(cursor.id)?.remove();
          renderCursor({ lineHeight, left, top, ...cursor });
        }}
      >
        test cursor pos 5
      </Button>

      {/* <>
        <p>readonly: {!!docStore.readonly ? 'yes' : 'no'}</p>
        <p>doc share: {JSON.stringify(documentShareStore)} </p>
        <div className="flex">
          <p>sock status: {socketStore.status} </p>
          {socketStore.status === 'connected' ? (
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
          ) : (
            <div className="w-5 h-5 bg-red-500 rounded-full"></div>
          )}
        </div>

        <Button
          onClick={() => {
            const cords = editorRef.current?.view.coordsAtPos(10, IMPORTANT_SIDE) as Rect;

            console.log('='.repeat(20));
            console.log(cords);
          }}
        >
          pos
        </Button>
        <Button
          onClick={() => {
            const cursor = arrOfCursors[0];
            const { left, lineHeight, top } = calculateCords({
              characterPosition: 10,
              editorDom: document.querySelector('.cm-editor')!,
              contentDom: document.querySelector('.cm-content')!,
            });

            document.getElementById(cursor.id)?.remove();
            renderCursor({ lineHeight, left, top, ...cursor });
          }}
        >
          test cursor pos 10
        </Button>
        <Button
          onClick={() => {
            const cursor = arrOfCursors[0];
            const { left, lineHeight, top } = calculateCords({
              characterPosition: 50,
              editorDom: document.querySelector('.cm-editor')!,
              contentDom: document.querySelector('.cm-content')!,
            });

            document.getElementById(cursor.id)?.remove();
            renderCursor({ lineHeight, left, top, ...cursor });
          }}
        >
          test cursor pos 50
        </Button>
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
        value={docStore.initDoc?.toString()}
        onChange={(value, update) => {
          if (documentShareStore.isEnabled) {
            docStore.setInitDoc(Text.of([value]));

            //TODO here this is too much code
            if (update.docChanged && update.selectionSet) {
              if (!update.changes.length) {
                return;
              }

              const data = {
                changes: update.changes.toJSON(),
                sharedUniqueHash: documentStore.getDocumentStrict().sharedUniqueHash,
              };

              docEditSocket.emit(constants.socket.events.PushDoc, data);
            }

            return;
          }

          textDiffFromBeforeSave.current = value !== docStore.initDoc?.toString();

          const tabTitleStartsWithPrefix = document.title.startsWith(
            constants.general.tabEditModePrefix,
          );

          if (textDiffFromBeforeSave.current && !tabTitleStartsWithPrefix) {
            document.title = constants.general.tabEditModePrefix + document.title;
          }

          if (!textDiffFromBeforeSave.current && tabTitleStartsWithPrefix) {
            document.title = document.title.replace(constants.general.tabEditModePrefix, '');
          }
        }}
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
