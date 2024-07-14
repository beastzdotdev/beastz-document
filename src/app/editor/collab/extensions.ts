import {
  autocompletion,
  CompletionContext,
  CompletionResult,
  insertCompletionText,
  startCompletion,
} from '@codemirror/autocomplete';
import { basicSetup, Compartment, keymap, Prec } from '@uiw/react-codemirror';
import { insertTab, indentLess, insertNewlineKeepIndent } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';

//TODO: something prevents starting autocompletion when cursor is at the end of the line after some word like tab or space
//TODO: for example: this is some text on line <here after typing any auto completion does not work>
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
      {
        label: `<h1></h1>`,
        type: `variable`,
        apply: (view, _completion, from, to) => {
          const text = `<h1></h1>`;
          const cursorPosition = text.length / 2;

          view.dispatch({
            ...insertCompletionText(view.state, text, from, to),
            selection: {
              anchor: from + cursorPosition,
              // head: from + cursorPosition + 3, // <- if this is active then instead of cursor it is selection
            },
          });
        },
      },
      { label: `bold`, type: `variable`, apply: '***' }, //
      { label: `@`, type: `variable`, displayLabel: 'Table', apply: 'Table example @' }, //
      { label: `@`, type: `variable`, displayLabel: 'H1', apply: 'H! example @' }, //

      { label: `/`, type: `util`, displayLabel: 'Text', apply: '' }, //
      { label: `/Text Bold`, type: `util`, displayLabel: 'Text Bold', apply: '***' }, //

      { label: `custom`, type: `custom` },
      { label: `class`, type: `class` },
      { label: `constant`, type: `constant` },
      { label: `enum`, type: `enum` },
      { label: `function`, type: `function` },
      { label: `interface`, type: `interface` },
      { label: `keyword`, type: `keyword` },
      { label: `method`, type: `method` },
      { label: `namespace`, type: `namespace` },
      { label: `property`, type: `property` },
      { label: `text`, type: `text` },
      { label: `type`, type: `type` },
      { label: `variable`, type: `variable`, info: 'Addiotional', detail: 'Addiotional text' },
      { label: `variable1`, type: `variable`, info: 'Addiotional', detail: 'Addiotional text' },
      { label: `variable2`, type: `variable`, info: 'Addiotional', detail: 'Addiotional text' },
      {
        label: `variable3`,
        type: `variable`,
        info: 'Addiotional',
        detail: 'Addiotional text',
      },

      {
        label: 'username',
        type: 'keyword',
        apply: '{{ username }}',
        info: 'primitive wordlist - usernames from danielmiessler seclist',
      },

      { label: 'now', type: 'util', apply: new Date().toISOString() },
      { label: 'now2', type: 'util', apply: new Date().toUTCString() },
      { label: 'l unique', type: 'class', apply: 'l unique' },
      { label: 'match something', type: 'keyword', apply: 'haha' },
      { label: 'magic', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' },
      { label: 'maaaa2', type: 'text', apply: 'test2', detail: 'Override' },
      { label: 'maaaa1', type: 'text', apply: 'test1', detail: 'macro' },
      { label: 'hello', type: 'variable', info: '(World)' },
      { label: '/x', type: 'variable', info: '(World)', apply: 'Hello World!' },
    ],
  };
}
export const autoCompleteCompartment = new Compartment();
export const autoCompleteExtension = autocompletion({
  defaultKeymap: true,
  activateOnTyping: true,
  activateOnTypingDelay: 0,
  override: [myCompletions],
  tooltipClass: () => 'ͼlu-tooltip',
  optionClass(completion) {
    // console.log(completion);

    return 'my-custom-class';
  },
});

export const highestPredesenceKeymapExtensions = Prec.highest(
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
    {
      key: 'Alt-Space',
      run: startCompletion,
    },
  ])
);

export const indentUnitExtension = indentUnit.of('\t');
export const basicSetupExtension = basicSetup({
  foldGutter: true,
  allowMultipleSelections: true,
  highlightActiveLine: true,
  lineNumbers: true,
  defaultKeymap: true,
  autocompletion: true,
  completionKeymap: true,
});
