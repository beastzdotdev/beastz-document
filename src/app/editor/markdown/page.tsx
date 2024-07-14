'use client';

import CodeMirror, {
  EditorView,
  Extension,
  ReactCodeMirrorProps,
  StateEffect,
  oneDark,
} from '@uiw/react-codemirror';
import { useEffect, useMemo, useState } from 'react';
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
import * as themesx from '@uiw/codemirror-themes-all';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

const themes = Object.assign(themesx, { oneDark });

type EditorTheme = ReactCodeMirrorProps['theme'];

console.log(themesx);
console.log(themes);

export default function EditorCollabPage(): JSX.Element {
  const [theme, setTheme] = useState<EditorTheme>('dark');
  const [view, setView] = useState<EditorView | null>(null);
  const [isAutocompleteActive, setIsAutocompleteActive] = useState(true);

  const themeOptions = useMemo(
    () =>
      ['dark', 'light']
        .concat(Object.keys(themes))
        .filter(item => typeof themes[item as keyof typeof themes] !== 'function')
        .filter(item => !/^(defaultSettings)/.test(item as keyof typeof themesx)),
    []
  );

  const extensions: Extension[] = useMemo(() => {
    const starterExtensions = [
      basicSetupExtension,
      indentUnitExtension,
      highestPredesenceKeymapExtensions,
      markdown({
        codeLanguages: languages,
      }),
    ];

    return starterExtensions;
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

  return (
    <>
      <div className="mb-5 flex gap-2 items-center">
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
        <CodeMirror
          value={"Hello\n\n```javascript\nlet x = 'y'\n```"}
          height="600px"
          autoFocus
          spellCheck
          readOnly={false}
          extensions={extensions}
          onCreateEditor={view => {
            setView(view);
          }}
          theme={(themes[theme as keyof typeof themes] || theme) as EditorTheme}
        />
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

const ChangeTheme = (params: {
  theme: EditorTheme;
  setTheme: React.Dispatch<React.SetStateAction<EditorTheme>>;
  themeOptions: string[];
}) => {
  return (
    <Select onValueChange={e => params.setTheme(e as EditorTheme)} value={params.theme as string}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
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
