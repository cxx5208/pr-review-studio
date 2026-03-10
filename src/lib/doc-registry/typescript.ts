import type { DocEntry } from '@/types'

export const typescriptDocEntries: DocEntry[] = [
  {
    id: 'ts-handbook',
    language: 'TypeScript',
    label: 'TypeScript Handbook',
    description: 'Type system: narrowing, generics, utility types, strict mode',
    officialUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    keywords: ['type', 'interface', 'generic', 'union', 'intersection', 'narrowing', 'assertion', 'satisfies', 'infer', 'keyof', 'typeof', 'mapped'],
    contextSnippets: [
      'Prefer interfaces for object shapes that may be extended; use type aliases for unions, intersections, and computed types. Both can describe objects.',
      'Narrowing: use typeof for primitives, instanceof for classes, in for property existence, discriminated unions with a literal field for exhaustive checks.',
      'Strict mode (strict: true) enables strictNullChecks, noImplicitAny, strictFunctionTypes. This is required for safe code. Non-null assertions (!) suppress errors without fixing them.',
      'Generics: constrain with extends (T extends string), use conditional types (T extends U ? X : Y) for type-level logic, use infer to extract parts of types.',
      'Utility types: Required<T>, Partial<T>, Readonly<T>, Record<K,V>, Pick<T,K>, Omit<T,K>, Extract<T,U>, Exclude<T,U>, ReturnType<F>, Parameters<F>, Awaited<T>.',
      'satisfies operator (TS 4.9+): validates a value against a type without widening it. Prefer over explicit type annotation when you want to preserve the literal type.',
    ],
    triggerPatterns: {
      extensions: ['.ts', '.tsx'],
      filenames: ['tsconfig.json', 'tsconfig.base.json'],
      contentPatterns: ['interface ', 'type ', ': string', ': number', '<T>'],
    },
  },
  {
    id: 'ts-react-hooks',
    language: 'TypeScript',
    label: 'React + TypeScript Patterns',
    description: 'Component typing, hooks, event handlers, context',
    officialUrl: 'https://react-typescript-cheatsheet.netlify.app',
    keywords: ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'ReactNode', 'ComponentProps', 'forwardRef', 'event handler'],
    contextSnippets: [
      'useState<T> infers from initial value or explicit generic. For nullable: useState<string | null>(null). For complex: useState<MyType>().',
      'Event handlers: React.ChangeEvent<HTMLInputElement>, React.MouseEvent<HTMLButtonElement>, React.FormEvent<HTMLFormElement>. Use e.currentTarget not e.target for typed access.',
      'useCallback and useMemo: wrap with useCallback when passing callbacks to memoized children. Stable references prevent unnecessary re-renders.',
      'useEffect cleanup: return a cleanup function to prevent memory leaks. Effect deps must include all referenced values to avoid stale closures.',
      'forwardRef<RefType, PropsType>: required when composing components that need DOM access. Combine with useImperativeHandle to expose a controlled API.',
      'ComponentProps<typeof MyComp> and HTMLAttributes<HTMLDivElement> are better than redefining prop types. Extend from native element props for polymorphic components.',
    ],
    triggerPatterns: {
      extensions: ['.tsx'],
      filenames: [],
      contentPatterns: ['React', 'useState', 'useEffect', 'jsx', 'tsx'],
    },
  },
]