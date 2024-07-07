'use client';

import * as themes from '@uiw/codemirror-themes-all';
import { autocompletion } from '@codemirror/autocomplete';
import { Extension, Prec, basicSetup, keymap, oneDark, useCodeMirror } from '@uiw/react-codemirror';
import { insertTab, indentLess, insertNewlineKeepIndent } from '@codemirror/commands';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { javascript } from '@codemirror/lang-javascript';

let something = null;

// console.log(something);

const highestPredesenceKeymapExtensions = Prec.highest(
  keymap.of([
    {
      key: 'Tab',
      preventDefault: true,
      run: insertTab,
    },
    {
      key: 'Shift-Tab',
      preventDefault: true,
      run: indentLess,
    },
    {
      key: 'Enter',
      preventDefault: true,
      run: ({ state, dispatch }) => {
        if (state.readOnly) {
          return false;
        }

        return insertNewlineKeepIndent({ state, dispatch });
      },
    },
  ])
);

const extensions: Extension[] = [
  basicSetup({
    foldGutter: false,
    allowMultipleSelections: true,
    highlightActiveLine: true,
    lineNumbers: true,
    defaultKeymap: true,
    autocompletion: true,
    completionKeymap: true,
  }),
  highestPredesenceKeymapExtensions,
  autocompletion({
    defaultKeymap: true,
    activateOnTyping: true,
    activateOnTypingDelay: 0,
  }),
  javascript(),
];

export default function EditorWithHookPage() {
  const editor = useRef<HTMLDivElement>(null);
  const { view, state, setView } = useCodeMirror({
    container: editor.current,
    extensions,
    value: '',
    height: '800px',
    theme: 'dark',
    autoFocus: true,
    spellCheck: true,
    readOnly: false,
  });

  // const [selectTheme, setSelectTheme] = useState<keyof typeof themesData>();

  const changeTheme = () => {
    // console.log(themes);
    // console.log(themes.duotoneDark);
    // const startState = EditorState.create({
    //   doc: 'Your code goes here...',
    //   extensions,
    // });
    // const view = new EditorView({
    //   state: startState,
    //   parent: document.body,
    //   extensions,
    // });
    // view.dispatch({
    //   effects: StateEffect.reconfigure.of([basicSetup, newTheme]),
    // });
    // setView(view);
    // setView(editorTheme.reconfigure(oneDark));
    // setView(() => editorTheme.reconfigure(oneDark));
    // console.log(view);
    // view?.dispatch({
    //   effects: StateEffect.reconfigure.of([...extensions, oneDark]),
    // });
  };

  return (
    <>
      <Button onClick={changeTheme}>theme</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-24">
          <Button variant="secondary">
            Themes
            {/* <MagnifyingGlassIcon className="h-4 w-4" /> */}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {}
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div ref={editor} />
    </>
  );
}
