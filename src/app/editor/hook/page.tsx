'use client';

import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import {
  Compartment,
  Extension,
  Prec,
  StateEffect,
  basicSetup,
  keymap,
  useCodeMirror,
} from '@uiw/react-codemirror';
import { insertTab, indentLess, insertNewlineKeepIndent } from '@codemirror/commands';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

async function myCompletions(context: CompletionContext): Promise<CompletionResult | null> {
  let word = context.matchBefore(/.*/s); // matches everything

  context.state.update({
    selection: { anchor: 1 },
  });

  if (word?.from == word?.to && !context.explicit) return null;

  // context.state.

  return {
    from: word?.from as number,
    options: [
      { label: `variable`, type: `variable`, info: 'Addiotional', detail: 'Addiotional text' },
      { label: `variable1`, type: `variable`, info: 'Addiotional', detail: 'Addiotional text' },
      { label: `variable2`, type: `variable`, info: 'Addiotional', detail: 'Addiotional text' },
    ],
  };
}

const autoCompleteExt = autocompletion({
  defaultKeymap: true,
  activateOnTyping: true,
  activateOnTypingDelay: 0,
  override: [myCompletions],
  tooltipClass: () => 'ͼlu-tooltip',
  optionClass(completion) {
    console.log(completion);

    return 'my-custom-class';
  },
});

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
];

const autoCompleteCompartment = new Compartment();

export default function EditorWithHookPage() {
  const editor = useRef<HTMLDivElement>(null);
  const [isAutocompleteActive, setIsAutocompleteActive] = useState(true);
  const { view } = useCodeMirror({
    container: editor.current,
    extensions,
    value: '',
    height: '800px',
    theme: 'dark',
    autoFocus: true,
    spellCheck: true,
    readOnly: false,
  });

  useEffect(() => {
    if (!view) {
      return;
    }

    if (isAutocompleteActive) {
      if (autoCompleteCompartment.get(view.state) === undefined) {
        view.dispatch({
          effects: StateEffect.appendConfig.of(autoCompleteCompartment.of(autoCompleteExt)),
        });
      } else {
        view.dispatch({
          effects: autoCompleteCompartment.reconfigure(autoCompleteExt),
        });
      }
    } else {
      view.dispatch({
        effects: autoCompleteCompartment.reconfigure([]),
      });
    }
  }, [isAutocompleteActive, view]);

  const toggle = () => {
    setIsAutocompleteActive(prev => !prev);
  };

  return (
    <>
      <div className="flex">
        <Button onClick={toggle}>toggle</Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="w-24 ml-4">
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
      </div>

      <div ref={editor} />
    </>
  );
}
