import * as themes from '@uiw/codemirror-themes-all';
import { insertTab, indentLess, insertNewlineKeepIndent } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
  insertCompletionText,
  startCompletion,
} from '@codemirror/autocomplete';
import {
  BasicSetupOptions,
  Compartment,
  EditorView,
  hoverTooltip,
  keymap,
  Prec,
} from '@uiw/react-codemirror';

//========================================
// Autocomplete Section
//========================================
const myCompletions = async (context: CompletionContext): Promise<CompletionResult | null> => {
  let word = context.matchBefore(/.*/s); // matches everything

  if (word?.from == word?.to && !context.explicit) return null;

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
      {
        label: '``` ```',
        type: `variable`,
        apply: (view, _completion, from, to) => {
          const text = '```\n\n```';
          const cursorPosition = text.length / 2;

          view.dispatch({
            ...insertCompletionText(view.state, text, from, to),
            selection: { anchor: from + cursorPosition },
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
      { label: `variable`, type: `variable`, detail: 'Additional text' },
      { label: `variable1`, type: `variable`, detail: 'Additional text' },
      { label: `variable2`, type: `variable`, detail: 'Additional text' },
      { label: `With *info*`, type: `variable`, info: 'Additional', detail: 'Additional text' },
      { label: 'now', type: 'util', apply: new Date().toISOString() },
      { label: 'now2', type: 'util', apply: new Date().toUTCString() },
      { label: 'l unique', type: 'class', apply: 'l unique' },
      { label: 'match something', type: 'keyword', apply: 'haha' },
      { label: 'magic', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' },
      { label: 'maaaa2', type: 'text', apply: 'test2', detail: 'Override' },
      { label: 'maaaa1', type: 'text', apply: 'test1', detail: 'macro' },
      { label: 'hello', type: 'variable' },
      { label: '/x', type: 'variable', apply: 'Hello World!' },
    ],
  };
};
export const autoCompleteCompartment = new Compartment();
export const autoCompleteExtension = autocompletion({
  defaultKeymap: true,
  activateOnTyping: true,
  activateOnTypingDelay: 0,
  override: [myCompletions],
  tooltipClass: () => 'ͼlu-tooltip',
  optionClass(_completion) {
    return 'my-custom-class';
  },
});

//========================================
// Keymap Section
//========================================
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

//========================================
// Hover Tooltip Section
//========================================
export const wordHoverExtension = hoverTooltip((view, pos, side) => {
  let { from, to, text } = view.state.doc.lineAt(pos);
  let start = pos,
    end = pos;

  while (start > from && /\w/.test(text[start - from - 1])) start--;
  while (end < to && /\w/.test(text[end - from])) end++;

  if ((start == pos && side < 0) || (end == pos && side > 0)) return null;

  let word = text.slice(start - from, end - from);
  text = 'tooltip info text';

  return {
    pos: start,
    end,
    above: false,
    create(view) {
      let dom = document.createElement('tag-div');
      dom.className = 'cm-tooltip-cursor';
      EditorView.baseTheme({
        '.cm-tooltip-lint': {
          width: '80%',
        },
        '.cm-tooltip-cursor': {
          border: 'none',
          padding: '5px',
          borderRadius: '4px',
          '& .cm-tooltip-arrow:before': {
            borderTopColor: '#66b !important',
          },
          '& .cm-tooltip-arrow:after': {
            borderTopColor: 'transparent',
          },
        },
      });
      dom.textContent = text;
      return { dom };
    },
  };
});

//========================================
// Identation Section
//========================================
export const indentUnitExtension = indentUnit.of('\t');

//========================================
// Main Section
//========================================
const basicSetupOption: BasicSetupOptions = {
  lineNumbers: false,
  foldGutter: false,
  allowMultipleSelections: true,
  highlightActiveLine: true,
  defaultKeymap: true,
  autocompletion: true,
  completionKeymap: true,
  bracketMatching: true,
};
const getAllTheme = () => {
  return ['dark', 'light']
    .concat(Object.keys(themes))
    .filter(item => typeof themes[item as keyof typeof themes] !== 'function')
    .filter(item => !/^(defaultSettings)/.test(item as keyof typeof themes));
};
const getAllExtension = () => {
  return [
    wordHoverExtension,
    highestPredesenceKeymapExtensions,

    EditorView.lineWrapping,

    //! this is needed for extension toggle to work, see in toggle-extensions folder
    autoCompleteCompartment.of(autoCompleteExtension),
  ];
};

/**
 * @description Main configuration for all codemirror editors
 */
export const docConfigBundle = {
  basicSetupOption,
  getAllTheme,
  getAllExtension,
};
