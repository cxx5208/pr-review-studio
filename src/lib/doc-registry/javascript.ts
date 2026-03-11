import type { DocEntry } from '@/types';

export const javascriptDocEntries: DocEntry[] = [
  {
    id: 'js-modern',
    language: 'JavaScript',
    label: 'Modern JavaScript',
    description: 'ES6+ features, destructuring, modules',
    officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    keywords: ['const', 'let', 'arrow', 'destructuring', 'spread', 'async', 'await'],
    contextSnippets: [
      'Use const by default, let only when reassignment needed. Avoid var.',
      'Arrow functions dont have their own this. Use them for callbacks.',
      'Destructuring: const { a, b } = obj, const [first, ...rest] = arr.',
      'Spread operator ... for copying and merging: [...arr], { ...obj }.',
      'Use async/await for asynchronous code. They are syntactic sugar over Promises.',
      'Use optional chaining (a?.b) and nullish coalescing (a ?? b) for safer access.',
    ],
    triggerPatterns: {
      extensions: ['.js', '.jsx', '.mjs'],
      filenames: ['package.json'],
      contentPatterns: ['const ', 'let ', '=>', 'async ', 'await ', '...'],
    },
  },
  {
    id: 'js-modules',
    language: 'JavaScript',
    label: 'ES Modules',
    description: 'import, export, CommonJS',
    officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
    keywords: ['import', 'export', 'default', 'named', 'require', 'module'],
    contextSnippets: [
      'Use ES modules (.mjs or "type": "module" in package.json).',
      'Named exports: export const foo = ... Import: import { foo } from .',
      'Default export: export default class ... Import: import MyClass from .',
      'Re-export for barrel files: export * from ./module or export { foo } from .',
      'Dynamic import() loads modules on demand. Returns a Promise.',
      'Avoid CommonJS (require/module.exports) in new code. Use ES modules.',
    ],
    triggerPatterns: {
      extensions: ['.js', '.mjs'],
      filenames: [],
      contentPatterns: ['import ', 'export ', 'require(', 'module.exports'],
    },
  },
  {
    id: 'js-async',
    language: 'JavaScript',
    label: 'Async Patterns',
    description: 'Promises, async/await, concurrency',
    officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    keywords: ['Promise', 'then', 'catch', 'finally', 'Promise.all', 'Promise.race'],
    contextSnippets: [
      'Promise states: pending, fulfilled, rejected. Once settled, state cannot change.',
      'Use .then()/.catch()/.finally() or async/await. Avoid mixing styles.',
      'Promise.all() runs promises in parallel. Promise.allSettled() waits for all, never rejects.',
      'Promise.race() resolves/rejects with first settled. Promise.any() resolves with first fulfilled.',
      'for await...of for iterating over async iterables.',
      'Use AbortController to cancel fetch and other async operations.',
    ],
    triggerPatterns: {
      extensions: ['.js', '.jsx'],
      filenames: [],
      contentPatterns: ['new Promise', '.then(', '.catch(', 'Promise.all', 'async function'],
    },
  },
];
