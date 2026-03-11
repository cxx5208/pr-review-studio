import type { DocEntry } from '@/types';

export const javaDocEntries: DocEntry[] = [
  {
    id: 'java-coding',
    language: 'Java',
    label: 'Java Coding Conventions',
    description: 'Style, naming, code organization',
    officialUrl: 'https://www.oracle.com/java/technologies/javase/codeconventions.html',
    keywords: ['class', 'interface', 'method', 'package', 'import'],
    contextSnippets: [
      'Class names in PascalCase. Methods and variables in camelCase. Constants in UPPER_SNAKE_CASE.',
      'Four spaces for indentation. Max line length of 80-120 characters.',
      'Opening brace on same line, closing brace on its own line.',
      'Order: package, imports, class. Within class: fields, constructors, methods.',
      'Use @Override when overriding methods. Always include @Override for interface methods.',
      'Prefer composition over inheritance. Use final classes unless designed for extension.',
    ],
    triggerPatterns: {
      extensions: ['.java'],
      filenames: ['pom.xml', 'build.gradle'],
      contentPatterns: ['public class', 'public interface', 'private ', 'protected '],
    },
  },
  {
    id: 'java-streams',
    language: 'Java',
    label: 'Streams API',
    description: 'Functional programming with streams',
    officialUrl: 'https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html',
    keywords: ['stream', 'filter', 'map', 'reduce', 'collect', 'optional'],
    contextSnippets: [
      'Streams are not data structures. They process data lazily.',
      'Use filter() to narrow, map() to transform, collect() to aggregate.',
      'Method references (String::length) and lambdas (s -> s.length()) reduce boilerplate.',
      'Avoid side effects in stream operations. They may be parallelized.',
      'Use Optional to avoid null checks. Prefer orElseGet() over orElse() for lazy evaluation.',
      'collect() with groupingBy() creates grouped results. partitionBy() splits into two groups.',
    ],
    triggerPatterns: {
      extensions: ['.java'],
      filenames: [],
      contentPatterns: ['.stream()', '.filter(', '.map(', '.collect(', 'Optional'],
    },
  },
  {
    id: 'java-concurrency',
    language: 'Java',
    label: 'Concurrency',
    description: 'Threads, executors, synchronized',
    officialUrl: 'https://docs.oracle.com/javase/tutorial/essential/concurrency/',
    keywords: ['thread', 'executor', 'synchronized', 'volatile', 'atomic', 'concurrent'],
    contextSnippets: [
      'Prefer high-level concurrency utilities over raw threads. Use ExecutorService.',
      'synchronized methods/blocks provide mutual exclusion. Keep synchronized sections small.',
      'volatile ensures visibility across threads. Does not provide atomicity.',
      'Atomic classes (AtomicInteger, etc.) for lock-free counters.',
      'Concurrent collections (ConcurrentHashMap, CopyOnWriteArrayList) for thread-safe access.',
      'CompletableFuture for async pipelines and composition.',
    ],
    triggerPatterns: {
      extensions: ['.java'],
      filenames: [],
      contentPatterns: ['Thread.', 'ExecutorService', 'synchronized', 'volatile ', 'Atomic'],
    },
  },
];
