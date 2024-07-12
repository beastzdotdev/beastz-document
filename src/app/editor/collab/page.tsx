'use client';

import CodeMirror, {
  EditorView,
  Extension,
  ReactCodeMirrorProps,
  StateEffect,
  Text,
} from '@uiw/react-codemirror';
import { useEffect, useMemo, useState } from 'react';
import { socket } from '@/socket';
import { getDocument, peerExtension } from '@/app/editor/collab/collab';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  autoCompleteCompartment,
  autoCompleteExtension,
  basicSetupExtension,
  highestPredesenceKeymapExtensions,
  indentUnitExtension,
} from '@/app/editor/collab/extensions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as themes from '@uiw/codemirror-themes-all';

export default function EditorCollabPage(): JSX.Element {
  const [theme, setTheme] = useState<ReactCodeMirrorProps['theme']>('dark');
  const [view, setView] = useState<EditorView | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');
  const [version, setVersion] = useState<number>();
  const [doc, setDoc] = useState<Text>();
  const [isAutocompleteActive, setIsAutocompleteActive] = useState(true);

  const themeOptions = useMemo(
    () =>
      ['dark', 'light']
        .concat(Object.keys(themes))
        .filter(item => typeof themes[item as keyof typeof themes] !== 'function')
        .filter(item => !/^(defaultSettings)/.test(item as keyof typeof themes)),
    []
  );

  const extensions: Extension[] = useMemo(() => {
    const starterExtensions = [
      basicSetupExtension,
      indentUnitExtension,
      highestPredesenceKeymapExtensions,
    ];

    if (doc !== undefined && version !== undefined) {
      console.log('executing here ' + '+'.repeat(20));

      starterExtensions.push(peerExtension(socket, version));
    }

    return starterExtensions;
  }, [doc, version]);

  useEffect(() => {
    async function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on('upgrade', transport => {
        setTransport(transport.name);
      });

      const { version, doc } = await getDocument(socket);

      console.log(version);
      console.log(doc);

      setVersion(version);
      setDoc(doc);
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport('N/A');
    }

    console.log('initial');

    ///======================
    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

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
    if (!view) {
      return;
    }

    console.log('should activate');

    if (isAutocompleteActive) {
      if (autoCompleteCompartment.get(view.state) === undefined) {
        console.log('[[][][]]append autocomplete');

        view.dispatch({
          effects: StateEffect.appendConfig.of(autoCompleteCompartment.of(autoCompleteExtension)),
        });
      } else {
        view.dispatch({
          effects: autoCompleteCompartment.reconfigure(autoCompleteExtension),
        });
      }
    } else {
      view.dispatch({
        effects: autoCompleteCompartment.reconfigure([]),
      });
    }
  }, [isAutocompleteActive, view, theme]);

  console.log('rerender codemirror component');

  return (
    <>
      <div className="mb-5 flex gap-2 items-center">
        <SocketStatus isConnected={isConnected} transport={transport} />

        <Separator />

        <ToggleAutoComplete
          isAutocompleteActive={isAutocompleteActive}
          setIsAutocompleteActive={setIsAutocompleteActive}
        />

        <Separator />

        <ChangeTheme theme={theme} setTheme={setTheme} themeOptions={themeOptions} />
      </div>

      <h1>Hello </h1>

      <div className="max-w-[850px]">
        {doc !== undefined && version !== undefined ? (
          <CodeMirror
            value={doc.toString()}
            height="600px"
            autoFocus
            spellCheck
            readOnly={false}
            extensions={extensions}
            onCreateEditor={view => {
              setView(view);
            }}
            theme={(themes[theme as keyof typeof themes] || theme) as ReactCodeMirrorProps['theme']}
          />
        ) : (
          <p>...loading</p>
        )}
      </div>
    </>
  );
}

const Separator = () => <div className="w-px h-10 bg-slate-300" />;

const ToggleAutoComplete = (params: {
  isAutocompleteActive: boolean;
  setIsAutocompleteActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="isAutocompleteActive"
        checked={params.isAutocompleteActive}
        onCheckedChange={() => params.setIsAutocompleteActive(prev => !prev)}
      />
      <Label htmlFor="isAutocompleteActive" className="cursor-pointer">
        Toggle autocomplete
      </Label>
    </div>
  );
};

const SocketStatus = (params: { isConnected: boolean; transport: string }) => {
  return (
    <div className="flex flex-col">
      <p className="flex items-center">
        Status: {params.isConnected ? 'connected' : 'disconnected'}
        {params.isConnected ? (
          <span className="h-5 w-5 bg-green-500 inline-block rounded-full border border-white ml-2" />
        ) : (
          <span className="h-5 w-5 bg-red-500 inline-block rounded-full border border-white ml-2" />
        )}
      </p>
      <p>Transport: {params.transport}</p>
    </div>
  );
};

const ChangeTheme = (params: {
  theme: ReactCodeMirrorProps['theme'];
  setTheme: React.Dispatch<React.SetStateAction<ReactCodeMirrorProps['theme']>>;
  themeOptions: string[];
}) => {
  return (
    <Select
      onValueChange={e => params.setTheme(e as ReactCodeMirrorProps['theme'])}
      value={params.theme as string}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
        {/* <SelectValue placeholder="Theme" /> */}
      </SelectTrigger>
      <SelectContent>
        {params.themeOptions.map(e => (
          <SelectItem key={Math.random() + e} value={e}>
            {e}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
