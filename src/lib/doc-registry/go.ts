import type { DocEntry } from '@/types';

export const goDocEntries: DocEntry[] = [
  {
    id: 'go-effective',
    language: 'Go',
    label: 'Effective Go',
    description: 'Best practices, idioms, style',
    officialUrl: 'https://go.dev/doc/effective_go',
    keywords: ['goroutine', 'channel', 'defer', 'panic', 'recovery', 'interface', 'struct', 'slice', 'map', 'concurrency'],
    contextSnippets: [
      'Use goroutines for concurrent operations. They are lightweight threads managed by the Go runtime.',
      'Channels are the preferred way to communicate between goroutines. Use unbuffered channels for synchronization, buffered for buffering.',
      'defer is used to ensure resources are released. It runs regardless of how the function exits.',
      'Never panic in production code. Use error returns and recover() only for truly unrecoverable situations.',
      'Interfaces should be small and focused. Duck typing means you do not need to declare interfaces explicitly.',
      'Pass pointers only when you need to modify the value or avoid copying large structs.',
    ],
    triggerPatterns: {
      extensions: ['.go'],
      filenames: ['go.mod', 'go.sum'],
      contentPatterns: ['func ', 'package ', 'go ', 'chan ', 'defer ', 'goroutine'],
    },
  },
  {
    id: 'go-stdlib',
    language: 'Go',
    label: 'Go Standard Library',
    description: 'Common packages: context, errors, fmt, io, net/http',
    officialUrl: 'https://pkg.go.dev/std',
    keywords: ['context', 'error', 'fmt', 'io', 'http', 'json', 'time', 'sync', 'atomic'],
    contextSnippets: [
      'context.Context should be the first parameter. It carries deadlines, cancellation signals, and request-scoped values.',
      'Use fmt.Errorf with %w to wrap errors. This preserves the error chain for debugging.',
      'io.Reader and io.Writer interfaces are everywhere. Use composition with io.LimitReader, io.TeeReader, etc.',
      'http.Client should be reused. Create once and reuse for all requests.',
      'sync.Mutex for protecting shared state. Prefer sync.RWMutex when reads dominate writes.',
      'time.After creates a timer that must be stopped. Use select with default case to avoid goroutine leaks.',
    ],
    triggerPatterns: {
      extensions: ['.go'],
      filenames: [],
      contentPatterns: ['context.', 'fmt.', 'http.', 'json.', 'sync.'],
    },
  },
  {
    id: 'go-testing',
    language: 'Go',
    label: 'Go Testing',
    description: 'Testing patterns, benchmarks, fuzzing',
    officialUrl: 'https://go.dev/doc/testing',
    keywords: ['testing', 't.Errorf', 't.Run', 'benchmark', 'example', 'fuzz'],
    contextSnippets: [
      'Name test files *_test.go. Test functions start with Test.',
      'Use t.Run to create subtests. This gives granular control and better failure messages.',
      'Table-driven tests reduce duplication: define cases in a slice and loop.',
      'Benchmark functions start with Benchmark. Run with -bench=. Use b.ReportAllocs() for memory metrics.',
      'Example functions serve as documentation and are tested automatically.',
      'Fuzz testing (go 1.18+) finds edge cases. Use -fuzz to run fuzzers.',
    ],
    triggerPatterns: {
      extensions: ['.go'],
      filenames: [],
      contentPatterns: ['func Test', 'func Benchmark', 'func Example'],
    },
  },
];
