import type { DocEntry } from '@/types';

export const csharpDocEntries: DocEntry[] = [
  {
    id: 'csharp-style',
    language: 'C#',
    label: 'C# Coding Conventions',
    description: 'Naming, style, best practices',
    officialUrl: 'https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions',
    keywords: ['class', 'interface', 'struct', 'record', 'namespace', 'using'],
    contextSnippets: [
      'Use PascalCase for types and methods, camelCase for local variables and parameters.',
      'Prefer readonly fields. Use const for compile-time constants.',
      'Use record for immutable DTOs. Use class for mutable entities.',
      'Use pattern matching (is, switch) for type checks and extraction.',
      'Use expression-bodied members for simple getters and one-liners.',
      'Prefer string interpolation over string.Format or concatenation.',
    ],
    triggerPatterns: {
      extensions: ['.cs'],
      filenames: ['.csproj'],
      contentPatterns: ['public class', 'namespace ', 'using ', 'interface ', 'record '],
    },
  },
  {
    id: 'csharp-async',
    language: 'C#',
    label: 'Async Programming',
    description: 'async/await, Task, ConfigureAwait',
    officialUrl: 'https://docs.microsoft.com/en-us/dotnet/csharp/async',
    keywords: ['async', 'await', 'Task', 'Task<T>', 'ConfigureAwait', 'ValueTask'],
    contextSnippets: [
      'async methods should return Task or Task<T>. Use void only for event handlers.',
      'Use ConfigureAwait(false) in library code to avoid forcing resume on original context.',
      'Use Task.WhenAll for parallel execution. Use Task.WhenAny for racing.',
      'ValueTask<T> for synchronous paths that may become async. Avoid in hot paths.',
      'CancellationToken: pass it to all async operations. Check it periodically.',
      'Avoid async void. Always return Task from async methods.',
    ],
    triggerPatterns: {
      extensions: ['.cs'],
      filenames: [],
      contentPatterns: ['async Task', 'await ', 'Task.', 'ConfigureAwait', 'CancellationToken'],
    },
  },
  {
    id: 'csharp-linq',
    language: 'C#',
    label: 'LINQ',
    description: 'Language integrated queries',
    officialUrl: 'https://docs.microsoft.com/en-us/dotnet/csharp/linq/',
    keywords: ['Select', 'Where', 'OrderBy', 'GroupBy', 'Join', 'Aggregate'],
    contextSnippets: [
      'Deferred execution: queries dont run until enumerated. Materialize with ToList() or foreach.',
      'Use method syntax for complex queries. Query syntax for readability on complex joins.',
      'Where filters, Select transforms, OrderBy/ThenBy sorts, GroupBy groups.',
      'First/FirstOrDefault/Single/SingleOrDefault for single element retrieval.',
      'Any/All/Contains for boolean checks. Count/Sum/Max/Average for aggregation.',
      'SelectMany flattens nested collections. Let introduces new range variables.',
    ],
    triggerPatterns: {
      extensions: ['.cs'],
      filenames: [],
      contentPatterns: ['.Select(', '.Where(', '.OrderBy(', '.GroupBy(', 'from '],
    },
  },
];
