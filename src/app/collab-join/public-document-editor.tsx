'use client';

import * as themes from '@uiw/codemirror-themes-all';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror, { ChangeSet, EditorView, Extension, Rect, Text } from '@uiw/react-codemirror';

import { bus } from '@/lib/bus';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { CursorData, EditorTheme, SocketError } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { cleanURL, copyToClipboard, randomHexColor, sleep, wordCount } from '@/lib/utils';
import { docEditSocketPublic } from '@/app/(auth)/document/[documentId]/_components/socket';
import { constants } from '@/lib/constants';
import { useJoinedPeopleStore, useSocketStore } from '@/app/(auth)/document/[documentId]/state';
import { useCodemirrorStore } from '@/app/collab-join/state';
import { getCollabActiveParticipantsPublic, getDocumentTextPublic } from '@/lib/api/definitions';
import { ExceptionMessageCode } from '@/lib/enums/exception-message-code.enum';
import { openSearchPanel } from '@codemirror/search';

const DEFAULT_PADDING = 30; // can be modified
const IMPORTANT_SIDE = -1;

/**
 * @important
 * ! state given from useRef is only initial state
 * ! if you want to access state current from codemirror 6 then access it view editor.view.state
 */
export const PublicDocumentEditor = (): JSX.Element => {
  const [theme, _setTheme] = useState<EditorTheme>('dark');
  const router = useRouter();
  const searchParams = useSearchParams();
  const sharedUniqueHash = searchParams.get(constants.general.querySharedUniqueHash) as string;
  const title = searchParams.get(constants.general.queryTitleForDocument) as string;

  const editorRef = useRef<{ view: EditorView }>(null);
  const isInitPullDocFull = useRef(true);

  const joinedPeopleStore = useJoinedPeopleStore();
  const codemirrorStore = useCodemirrorStore();
  const socketStore = useSocketStore();

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

  const handleKeyDownGlobally = async (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const calculateCords = useCallback(
    (props: { characterPosition: number; editorDom: Element; contentDom: Element }) => {
      const { characterPosition, editorDom, contentDom } = props;

      // Get coordinates for left position calculation, this gives positions for
      const cords = editorRef.current?.view.coordsAtPos(characterPosition, IMPORTANT_SIDE) as Rect;
      // const cords = view().coordsAtPos(characterPosition, IMPORTANT_SIDE) as Rect;

      console.log('='.repeat(20) + 'calling calc cords');
      console.log(cords);

      const defaultLineHeight = Math.round(editorRef.current?.view.defaultLineHeight as number);

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
    [],
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

  const onCursorLocationChange = useCallback(
    (data: { socketId: string; cursorCharacterPos: number }) => {
      console.log('hi');
      console.log(data);

      const { cursorCharacterPos, socketId } = data;

      const cursorData = useJoinedPeopleStore.getState().people.find(e => e.socketId === socketId);

      if (!cursorData) {
        return;
      }

      const { left, lineHeight, top } = calculateCords({
        characterPosition: cursorCharacterPos,
        editorDom: document.querySelector('.cm-editor')!,
        contentDom: document.querySelector('.cm-content')!,
      });

      document.getElementById(socketId)?.remove();

      renderCursor({
        lineHeight,
        left,
        top,
        color: cursorData.color,
        id: cursorData.socketId,
        text: cursorData.text,
      });
    },
    [calculateCords, renderCursor],
  );

  const onDelete = useCallback(
    () => {
      const { doc, selection } = view().state;
      const { from, to, anchor } = selection.main;

      const changes = ChangeSet.of([{ from, to, insert: '' }], doc.length);

      view().dispatch({
        changes,
        scrollIntoView: false,
      });

      // emit change from here because onChange does not accept this event from component
      docEditSocketPublic.emit(constants.socket.events.PushDoc, {
        changes: changes.toJSON(),
        sharedUniqueHash,
        cursorCharacterPos: anchor,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorRef.current?.view],
  );

  const onFindAndReplace = useCallback(
    () => openSearchPanel(view()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorRef.current?.view],
  );

  const totalWordCount = useCallback(
    () => {
      const length = wordCount(view().state.doc.toString());
      toast.info(`Word count is ${length}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorRef.current?.view],
  );

  const onDownload = useCallback(
    (type: 'markdown' | 'text') => {
      let ext = '.txt';

      switch (type) {
        case 'markdown':
          ext = '.md';
          break;
        case 'text':
        default:
          ext = '.txt';
      }

      // remove already existing ext from title and add custom one
      const newTitle = title.split('.').slice(0, -1).join('.').concat(ext);

      const text = view().state.doc.toString();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = newTitle;
      a.click();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorRef.current?.view],
  );

  useEffect(
    () => {
      // bus.on('menubar:edit:undo', () => {});
      // bus.on('menubar:edit:redo', () => {});
      bus.on('menubar:edit:cut', () => window.getSelection()?.deleteFromDocument());
      bus.on('menubar:edit:copy', copySelected);
      // bus.on('menubar:edit:paste', onPaste);
      bus.on('menubar:edit:select-all', selectAll);
      bus.on('menubar:edit:delete', onDelete);
      bus.on('menubar:edit:find-and-replace', onFindAndReplace);
      bus.on('menubar:edit:tools:word-count', totalWordCount);

      bus.on('menubar:file:download', onDownload);
      // bus.on('menubar:file:details', () => {});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(
    () => {
      docEditSocketPublic.on('connect_error', (err: SocketError) => {
        if (err?.message === ExceptionMessageCode.DOCUMENT_DISABLED) {
          router.push(
            cleanURL(constants.path.oops, {
              message: 'Document sharing no longer enabled',
            }).toString(),
          );
          return;
        }

        toast.error(err.message);
        console.dir('connect_error');
        console.dir(err);
      });
      //========================================================

      window.addEventListener('keydown', handleKeyDownGlobally);

      if (!docEditSocketPublic.connected) {
        docEditSocketPublic.connect();
      }

      docEditSocketPublic.on('connect', async () => {
        useSocketStore.getState().setStatus('connected');
      });

      docEditSocketPublic.on('disconnect', () => {
        useSocketStore.getState().setStatus('disconnected');
      });

      docEditSocketPublic.on('error', (err: SocketError) => {
        console.log('Socket error', err);
      });

      docEditSocketPublic.io.on('reconnect_attempt', reconnectNumber => {
        console.log('RECONNECT_ATTEMPT', reconnectNumber);
        useSocketStore.getState().setStatus('reconnecting');
      });

      docEditSocketPublic.io.on('reconnect_failed', () => {
        toast.warning('Sorry reconnection failed, click connection indicator to try reconnecting', {
          duration: 10000,
        });

        useSocketStore.getState().setStatus('disconnected');
      });

      // User defined events
      docEditSocketPublic.on(constants.socket.events.PullDocFull, async () => {
        const { data: text, error } = await getDocumentTextPublic(sharedUniqueHash);

        if (error || text === undefined) {
          toast.error('Sorry, could not load document');
          return;
        }

        if (isInitPullDocFull.current) {
          codemirrorStore.setInitDoc(Text.of([text])); // this only works on init
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
        codemirrorStore.setReadonly(false);

        const fsId = parseInt(searchParams.get('fsId') ?? '');

        if (typeof fsId !== 'number') {
          throw new Error('Something went wrong');
        }

        const { data, error: err } = await getCollabActiveParticipantsPublic(fsId);

        if (err || !data) {
          return;
        }

        // here socket id is known
        joinedPeopleStore.setPeople(
          data
            .filter(e => e !== docEditSocketPublic.id)
            .map((e, i) => ({
              socketId: e,
              color: randomHexColor(),
              text: `User ${i}`,
            })),
        );
      });

      docEditSocketPublic.on(
        constants.socket.events.PullDoc,
        (data: { changes: string; cursorCharacterPos: number; socketId: string }) => {
          //TODO Here we might need some kind of locker so that while pulldocfull is running we can't dispatch anything

          view().dispatch({
            scrollIntoView: false,
            changes: ChangeSet.fromJSON(data.changes),
          });

          onCursorLocationChange({
            socketId: data.socketId,
            cursorCharacterPos: data.cursorCharacterPos,
          });
        },
      );

      docEditSocketPublic.on(constants.socket.events.RetryConnection, async () => {
        docEditSocketPublic.disconnect();
        await sleep(1000);
        docEditSocketPublic.connect();
      });

      docEditSocketPublic.on(constants.socket.events.UserJoined, (data: { socketId: string }) => {
        const newData = joinedPeopleStore.people
          .concat({
            socketId: data.socketId,
            color: randomHexColor(),
            text: `Guest ${joinedPeopleStore.people.length}`,
          })
          .filter(e => e.socketId !== docEditSocketPublic.id);

        joinedPeopleStore.setPeople(newData);
      });

      docEditSocketPublic.on(constants.socket.events.UserLeft, (data: { socketId: string }) => {
        joinedPeopleStore.setPeople(
          joinedPeopleStore.people.filter(e => e.socketId !== data.socketId),
        );
      });

      return () => {
        window.removeEventListener('keydown', handleKeyDownGlobally);

        // native events
        docEditSocketPublic.off('connect');
        docEditSocketPublic.off('disconnect');
        docEditSocketPublic.off('error');

        docEditSocketPublic.io.off('reconnect_attempt');
        docEditSocketPublic.io.off('reconnect_failed');

        for (const event of Object.values(constants.socket.events)) {
          docEditSocketPublic.off(event);
        }

        docEditSocketPublic.disconnect();

        socketStore.clear();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      {/* <>
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
            docEditSocketPublic.connect();
          }}
        >
          connect
        </Button>
        <Button onClick={() => docEditSocketPublic.emit('test')}>test</Button>
        <Button onClick={() => docEditSocketPublic.disconnect()}>disconnect</Button>
        <Button onClick={() => docEditSocketPublic.io.engine.close()}>low-level diconnect</Button>
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
        value={codemirrorStore.initDoc?.toString()}
        width="1050px"
        className="w-fit mx-auto h-full cm-custom"
        autoFocus
        onUpdate={update => {
          if (update.docChanged && update.selectionSet) {
            if (!update.changes.length) {
              return;
            }

            docEditSocketPublic.emit(constants.socket.events.PushDoc, {
              changes: update.changes.toJSON(),
              sharedUniqueHash,
              cursorCharacterPos: view().state.selection.main.anchor,
            });
          }
        }}
        spellCheck
        editable={!codemirrorStore.readonly}
        readOnly={codemirrorStore.readonly}
        basicSetup={{
          ...docConfigBundle.basicSetupOption,
          lineNumbers: false,
          highlightActiveLine: !codemirrorStore.readonly,
          highlightActiveLineGutter: !codemirrorStore.readonly,
        }}
        extensions={extensions}
        theme={activeTheme}
      />
    </>
  );
};
