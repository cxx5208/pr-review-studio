import type { DocEntry } from '@/types';

export const rustDocEntries: DocEntry[] = [
  {
    id: 'rust-ownership',
    language: 'Rust',
    label: 'Ownership & Borrowing',
    description: 'Ownership, lifetimes, references',
    officialUrl: 'https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html',
    keywords: ['ownership', 'borrowing', 'reference', 'lifetime', 'clone', 'borrow'],
    contextSnippets: [
      'Each value has a single owner. When owner goes out of scope, value is dropped.',
      'References (&T) are borrowed, not owned. Only one mutable reference OR multiple immutable refs.',
      'Lifetime annotations (a) tell the compiler how references relate. Usually inferred.',
      'Use clone() when you need deep copy. Use Cow for read-or-write patterns.',
      'The borrow checker prevents data races at compile time.',
      'Arc<T> for shared ownership across threads, Rc<T> for single-threaded.',
    ],
    triggerPatterns: {
      extensions: ['.rs'],
      filenames: ['Cargo.toml'],
      contentPatterns: ['fn ', '&mut ', '&', 'impl ', 'pub fn', 'let mut'],
    },
  },
  {
    id: 'rust-error',
    language: 'Rust',
    label: 'Error Handling',
    description: 'Result, Option, panic, ? operator',
    officialUrl: 'https://doc.rust-lang.org/book/ch09-00-error-handling.html',
    keywords: ['Result', 'Option', '?', 'panic', 'unwrap', 'expect', 'anyhow'],
    contextSnippets: [
      'Use Result<T, E> for recoverable errors. Use ? for propagation.',
      'Use Option<T> for values that may or may not exist. Use .unwrap() carefully.',
      'Define custom error types implementing std::error::Error for libraries.',
      'Use anyhow for application code - simplifies error handling across modules.',
      'Use thiserror for deriving Error implementations on custom types.',
      'Prefer expect() with clear messages over unwrap() in production code.',
    ],
    triggerPatterns: {
      extensions: ['.rs'],
      filenames: [],
      contentPatterns: ['Result<', 'Option<', '?', '.unwrap()', '.expect(', '#[derive(Error)'],
    },
  },
  {
    id: 'rust-concurrency',
    language: 'Rust',
    label: 'Concurrency',
    description: 'Threads, async, message passing',
    officialUrl: 'https://doc.rust-lang.org/book/ch16-00-concurrency.html',
    keywords: ['thread', 'spawn', 'mutex', 'channel', 'async', 'await', 'tokio'],
    contextSnippets: [
      'Use std::thread::spawn for OS threads. Join handles for synchronization.',
      'Arc<T> for shared data across threads. Mutex<T> for interior mutability.',
      'mpsc channels for message passing. Produce/consume pattern.',
      'async/await with tokio or async-std for asynchronous programming.',
      'tokio::spawn for spawning async tasks. Use .await on JoinHandle to wait.',
      'tokio::select! for waiting on multiple async operations concurrently.',
    ],
    triggerPatterns: {
      extensions: ['.rs'],
      filenames: [],
      contentPatterns: ['thread::spawn', 'tokio::', 'async fn', 'await', 'Mutex::', 'Sender::'],
    },
  },
];
