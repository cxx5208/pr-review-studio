import type { DocEntry } from '@/types';

export const swiftDocEntries: DocEntry[] = [
  {
    id: 'swift-style',
    language: 'Swift',
    label: 'Swift API Design',
    description: 'Naming, parameters, protocols',
    officialUrl: 'https://www.swift.org/documentation/api-design-guidelines/',
    keywords: ['func', 'struct', 'class', 'enum', 'protocol', 'extension'],
    contextSnippets: [
      'Use camelCase for everything. Type names start with uppercase.',
      'Parameters should have external and internal names: func move(to x: Int, by y: Int)',
      'Prefer structs over classes unless you need inheritance or reference semantics.',
      'Use protocols for abstraction. Protocol extensions provide default implementations.',
      'Use guard early for validation. It forces early exit with optional unwrapping.',
      'Use @autoclosure for delayed evaluation. Use @escaping for callbacks.',
    ],
    triggerPatterns: {
      extensions: ['.swift'],
      filenames: ['Package.swift'],
      contentPatterns: ['func ', 'struct ', 'class ', 'enum ', 'protocol ', 'extension '],
    },
  },
  {
    id: 'swift-concurrency',
    language: 'Swift',
    label: 'Swift Concurrency',
    description: 'async/await, actors, tasks',
    officialUrl: 'https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html',
    keywords: ['async', 'await', 'actor', 'task', 'async let', 'TaskGroup'],
    contextSnippets: [
      'async/await provides structured concurrency. Mark async functions with async keyword.',
      'Task is the unit of async work. Use Task.detached for background work.',
      'async let for concurrent execution: async let data = fetch(), image = load().',
      'TaskGroup for dynamic concurrency. Use withTaskGroup for addTask/await.',
      'Actors provide thread-safe state. Use actor instead of class for shared mutable state.',
      'Use @MainActor for UI code. Run on main with MainActor.run or @MainActor properties.',
    ],
    triggerPatterns: {
      extensions: ['.swift'],
      filenames: [],
      contentPatterns: ['async ', 'await ', 'actor ', 'Task.', 'TaskGroup'],
    },
  },
];
