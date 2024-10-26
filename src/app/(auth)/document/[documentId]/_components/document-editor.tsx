'use client';

import * as themes from '@uiw/codemirror-themes-all';
import { toast } from 'sonner';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror, { ChangeSet, EditorView, Extension, Rect, Text } from '@uiw/react-codemirror';

import { bus } from '@/lib/bus';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { CursorData, EditorTheme, SocketError } from '@/lib/types';
import { docConfigBundle } from '@/components/app/editor/extensions';
import { copyToClipboard, randomHexColor, sleep, wordCount } from '@/lib/utils';
import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import {
  getCollabActiveParticipantsPublic,
  getDocumentText,
  moveToBin,
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
import { openSearchPanel } from '@codemirror/search';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { create } from 'zustand';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DEFAULT_PADDING = 30; // can be modified
const IMPORTANT_SIDE = -1;

const tempSolution = create<{
  textDiffFromBeforeSave: boolean;
  setTextDiffFromBeforeSave: (value: boolean) => void;
}>((set, get) => ({
  textDiffFromBeforeSave: false,
  setTextDiffFromBeforeSave: (value: boolean) => set({ textDiffFromBeforeSave: value }),
}));

/**
 * @important
 * ! state given from useRef is only initial state
 * ! if you want to access state current from codemirror 6 then access it view editor.view.state
 */
export const DocumentEditor = (): JSX.Element => {
  const [theme, _setTheme] = useState<EditorTheme>('dark');
  const params = useParams<{ documentId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get(constants.general.queryTitleForDocument) ?? '';

  const editorRef = useRef<{ view: EditorView }>(null);
  const textDiffFromBeforeSave = useRef(false);
  const isInitPullDocFull = useRef(true);

  const socketStore = useSocketStore();
  const docStore = useDocStore();
  const documentStore = useDocumentStore();
  const documentShareStore = useDocumentShareStore();
  const joinedPeopleStore = useJoinedPeopleStore();
  const temp = tempSolution();

  const extensions: Extension[] = useMemo(
    () => docConfigBundle.getAllExtension().concat(markdown({ codeLanguages: languages })),
    [],
  );

  const activeTheme = useMemo(
    () => (themes[theme as keyof typeof themes] || theme) as EditorTheme,
    [theme],
  );

  const selectAll = useCallback(() => {
    if (!editorRef.current?.view) {
      return;
    }
    const view = editorRef.current.view;

    view.dispatch({
      selection: { anchor: 0, head: view.state.doc.toString().length },
    });

    // focus after selecting all from menubar
    view.focus();
  }, []);

  const copySelected = useCallback(() => {
    if (!editorRef.current?.view) {
      return;
    }

    const view = editorRef.current.view;
    const selection = view.state.selection.main;

    if (!selection || selection.empty) {
      toast.warning('Nothing was selected');
      return;
    }

    const text = view.state.sliceDoc(selection.from, selection.to);
    copyToClipboard(text);

    toast.success('Copied to clipboard');
    return;
  }, []);

  const handleSaveBeforeShare = async (): Promise<boolean> => {
    if (!editorRef.current?.view) {
      return false;
    }

    const view = editorRef.current.view;

    if (textDiffFromBeforeSave.current) {
      const newText = view.state.doc.toString();

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
      temp.setTextDiffFromBeforeSave(false);
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
      const cords = editorRef.current?.view.coordsAtPos(characterPosition, IMPORTANT_SIDE) as Rect;

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

  const onDelete = useCallback(() => {
    if (!editorRef.current?.view) {
      return;
    }

    const view = editorRef.current.view;

    const { doc, selection } = view.state;
    const { from, to, anchor } = selection.main;

    const changes = ChangeSet.of([{ from, to, insert: '' }], doc.length);
    const sharedUniqueHash = documentStore.getDocumentStrict().sharedUniqueHash;

    view.dispatch({
      changes,
      scrollIntoView: false,
    });

    // emit change from here because onChange does not accept this event from component
    docEditSocket.emit(constants.socket.events.PushDoc, {
      changes: changes.toJSON(),
      sharedUniqueHash,
      cursorCharacterPos: anchor,
    });
  }, [documentStore]);

  const onFindAndReplace = useCallback(() => {
    if (!editorRef.current?.view) {
      return;
    }

    const view = editorRef.current.view;

    openSearchPanel(view);
  }, []);

  const totalWordCount = useCallback(() => {
    if (!editorRef.current?.view) {
      return;
    }

    const view = editorRef.current.view;

    const length = wordCount(view.state.doc.toString());
    toast.info(`Word count is ${length}`);
  }, []);

  const onDownload = useCallback(
    (type: 'markdown' | 'text') => {
      if (!editorRef.current?.view) {
        return;
      }

      const view = editorRef.current.view;

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

      const text = view.state.doc.toString();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = newTitle;
      a.click();
    },
    [title],
  );

  const pullDocFull = useCallback(async () => {
    if (!editorRef.current?.view) {
      return;
    }

    const view = editorRef.current.view;

    const { data: text, error } = await getDocumentText(parseInt(params.documentId));

    if (error || text === undefined) {
      toast.error('Sorry, could not load document');
      return;
    }

    if (isInitPullDocFull.current) {
      docStore.setInitDoc(Text.of([text])); // this only works on init
    } else {
      // replace all with new text
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
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
    joinedPeopleStore.setPeople(
      data
        .filter(e => e !== docEditSocket.id)
        .map((e, i) => ({
          socketId: e,
          color: randomHexColor(),
          text: `User ${i}`,
        })),
    );
  }, [docStore, documentShareStore, joinedPeopleStore, params.documentId]);

  const pullDoc = useCallback(
    (data: { changes: string; cursorCharacterPos: number; socketId: string }) => {
      if (!editorRef.current?.view) {
        return;
      }

      const view = editorRef.current.view;

      view.dispatch({
        scrollIntoView: false,
        changes: ChangeSet.fromJSON(data.changes),
      });

      onCursorLocationChange({
        socketId: data.socketId,
        cursorCharacterPos: data.cursorCharacterPos,
      });
    },
    [onCursorLocationChange],
  );

  const onFileDelete = useCallback(async () => {
    const { error } = await moveToBin(parseInt(params.documentId));

    if (error) {
      toast.warning('Something went wrong, please try again');
      return;
    }

    router.push(constants.path.home);
  }, [params.documentId, router]);

  useEffect(
    () => {
      // bus.on('menubar:edit:undo', () => {});
      // bus.on('menubar:edit:redo', () => {});
      // bus.on('menubar:edit:paste', onPaste);
      // bus.on('menubar:file:details', () => {});

      bus.on('menubar:edit:cut', () => window.getSelection()?.deleteFromDocument());
      bus.on('menubar:edit:copy', copySelected);
      bus.on('menubar:edit:select-all', selectAll);
      bus.on('menubar:edit:delete', onDelete);
      bus.on('menubar:edit:find-and-replace', onFindAndReplace);
      bus.on('menubar:edit:tools:word-count', totalWordCount);

      bus.on('menubar:file:download', onDownload);
      bus.on('menubar:file:delete', onFileDelete);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
      docEditSocket.on(constants.socket.events.PullDocFull, pullDocFull);

      docEditSocket.on(constants.socket.events.RetryConnection, async () => {
        docEditSocket.disconnect();
        await sleep(1000);
        docEditSocket.connect();
      });

      docEditSocket.on(constants.socket.events.PullDoc, pullDoc);

      docEditSocket.on(constants.socket.events.UserJoined, (data: { socketId: string }) => {
        const newData = joinedPeopleStore.people
          .concat({
            socketId: data.socketId,
            color: randomHexColor(),
            text: `Guest ${joinedPeopleStore.people.length}`,
          })
          .filter(e => e.socketId !== docEditSocket.id);

        joinedPeopleStore.setPeople(newData);
      });

      docEditSocket.on(constants.socket.events.UserLeft, (data: { socketId: string }) => {
        joinedPeopleStore.setPeople(
          joinedPeopleStore.people.filter(e => e.socketId !== data.socketId),
        );

        document.getElementById(data.socketId)?.remove();
      });

      // docEditSocket.on(constants.socket.events.CursorLocation, onCursorLocationChange);

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
      {/* <>
        <p>readonly: {!!docStore.readonly ? 'yes' : 'no'}</p>
        <p>doc share: {JSON.stringify(documentShareStore)} </p>
        <p>sock status: {socketStore.status} </p>
        <Button onClick={() => selectAll()}>select all</Button>
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

      {temp.textDiffFromBeforeSave && (
        <Card className="absolute top-[80px] right-[10px] p-2 text-sm z-10 cursor-pointer flex flex-col rounded-sm">
          <p>Unsaved changes, to save click</p>
          <div className="pt-1">
            <Badge>cmd/ctr + s</Badge>
          </div>
        </Card>
      )}

      <CodeMirror
        ref={editorRef}
        value={docStore.initDoc?.toString()}
        onChange={(value, update) => {
          if (documentShareStore.isEnabled) {
            docStore.setInitDoc(Text.of([value]));

            if (update.docChanged && update.selectionSet && update?.changes?.length) {
              const sharedUniqueHash = documentStore.getDocumentStrict().sharedUniqueHash;

              if (!editorRef.current?.view) {
                return;
              }

              const view = editorRef.current.view;

              docEditSocket.emit(constants.socket.events.PushDoc, {
                changes: update.changes.toJSON(),
                sharedUniqueHash,
                cursorCharacterPos: view.state.selection.main.anchor,
              });
            }

            return;
          }

          const difference = value !== docStore.initDoc?.toString();
          textDiffFromBeforeSave.current = difference;
          temp.setTextDiffFromBeforeSave(difference);

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
        className="w-fit h-full cm-custom relative"
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
