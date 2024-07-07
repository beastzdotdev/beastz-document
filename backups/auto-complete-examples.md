```tsx
async function myCompletions(context: CompletionContext): Promise<CompletionResult | null> {
  let word = context.matchBefore(/\w*/);

  if (word?.from == word?.to && !context.explicit) return null;

  return {
    from: word?.from as number,
    options: [
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
      { label: `variable3`, type: `variable`, info: 'Addiotional', detail: 'Addiotional text' },

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
```