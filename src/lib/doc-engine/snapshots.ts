import { DocEntry } from '@/types';
import { typescriptDocEntries } from '@/lib/doc-registry/typescript';

const goDocEntries: DocEntry[] = [
  {
    id: 'go-effective',
    language: 'Go',
    label: 'Effective Go',
    description: 'Best practices for Go programs',
    officialUrl: 'https://go.dev/doc/effective_go',
    keywords: ['func', 'package', 'import', 'struct', 'interface', 'goroutine', 'channel', 'defer', 'go', 'select'],
    contextSnippets: [
      'Use interfaces for polymorphism: type Reader interface { Read(p []byte) (n int, err error) }',
      'Use goroutines for concurrency: go func() { ... }()',
      'Use channels for communication: ch := make(chan int)',
      'Use defer for cleanup: defer file.Close()',
      'Use err != nil for error handling: if err != nil { return err }',
    ],
    triggerPatterns: {
      extensions: ['.go'],
      filenames: ['go.mod', 'go.sum'],
      contentPatterns: ['func ', 'package ', 'import ', 'go ', 'chan ', 'defer '],
    },
  },
];

export const staticDocSnapshots: Record<string, DocEntry[]> = {
  typescript: typescriptDocEntries,
  go: goDocEntries,
  javascript: typescriptDocEntries,
  python: [
    {
      id: 'py-docs',
      language: 'Python',
      label: 'Python Official Docs',
      description: 'Core Python documentation',
      officialUrl: 'https://docs.python.org/3/',
      keywords: ['def', 'class', 'import', 'async', 'await', 'typing', 'dict', 'list', 'tuple'],
      contextSnippets: [
        'Use type hints for function signatures: def greet(name: str) -> str:',
        'Use dataclasses for simple data containers: @dataclass',
        'Use async/await for I/O-bound operations: async def fetch():',
        'List comprehensions: [x for x in items if x > 0]',
      ],
      triggerPatterns: {
        extensions: ['.py'],
        filenames: ['requirements.txt', 'setup.py', 'pyproject.toml'],
        contentPatterns: ['def ', 'import ', 'from ', 'class ', 'async def'],
      },
    },
  ],
  rust: [
    {
      id: 'rust-docs',
      language: 'Rust',
      label: 'Rust Book',
      description: 'The Rust Programming Language',
      officialUrl: 'https://doc.rust-lang.org/book/',
      keywords: ['fn', 'let', 'mut', 'impl', 'struct', 'enum', 'trait', 'pub', 'use', 'mod'],
      contextSnippets: [
        'Use let for immutable bindings, let mut for mutable: let x = 5;',
        'Define structs for data: struct Point { x: f64, y: f64 }',
        'Define enums for variants: enum Result<T, E> { Ok(T), Err(E) }',
        'Use impl for methods: impl MyStruct { fn new() -> Self { ... } }',
      ],
      triggerPatterns: {
        extensions: ['.rs'],
        filenames: ['Cargo.toml', 'rustfmt.toml'],
        contentPatterns: ['fn ', 'let ', 'impl ', 'struct ', 'enum ', 'pub ', 'use '],
      },
    },
  ],
  java: [
    {
      id: 'java-docs',
      language: 'Java',
      label: 'Java SE Docs',
      description: 'Java Platform documentation',
      officialUrl: 'https://docs.oracle.com/en/java/javase/',
      keywords: ['class', 'public', 'private', 'void', 'static', 'interface', 'extends', 'implements'],
      contextSnippets: [
        'Use access modifiers: public, private, protected',
        'Use interfaces for abstraction: interface Reader { void read(); }',
        'Use @Override annotation for method overriding',
        'Use try-with-resources for automatic resource cleanup',
      ],
      triggerPatterns: {
        extensions: ['.java'],
        filenames: ['pom.xml', 'build.gradle'],
        contentPatterns: ['public class', 'private ', 'void ', 'import java'],
      },
    },
  ],
};

export function getDocEntriesForLanguage(language: string): DocEntry[] {
  const langLower = language.toLowerCase();
  return staticDocSnapshots[langLower] || [];
}

export function getAllDocEntries(): DocEntry[] {
  return Object.values(staticDocSnapshots).flat();
}
