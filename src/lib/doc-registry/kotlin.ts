import type { DocEntry } from '@/types';

export const kotlinDocEntries: DocEntry[] = [
  {
    id: 'kotlin-style',
    language: 'Kotlin',
    label: 'Kotlin Style Guide',
    description: 'Coding conventions, naming, idioms',
    officialUrl: 'https://kotlinlang.org/docs/coding-conventions.html',
    keywords: ['class', 'function', 'val', 'var', 'companion', 'object'],
    contextSnippets: [
      'Use four spaces for indentation. Max line length 120 characters.',
      'Naming: classes in PascalCase, functions and properties in camelCase.',
      'Prefer val over var. Use var only when value must change.',
      'Use sealed classes for hierarchies. Use data classes for DTOs.',
      'Functions with single expression can use = syntax: fun double(x: Int) = x * 2',
      'Default arguments reduce need for overloads. Use @JvmOverloads for Java interop.',
    ],
    triggerPatterns: {
      extensions: ['.kt', '.kts'],
      filenames: ['build.gradle.kts', 'settings.gradle.kts'],
      contentPatterns: ['fun ', 'val ', 'var ', 'class ', 'data class'],
    },
  },
  {
    id: 'kotlin-coroutines',
    language: 'Kotlin',
    label: 'Coroutines',
    description: 'Async programming, suspend, flow',
    officialUrl: 'https://kotlinlang.org/docs/coroutines-basics.html',
    keywords: ['suspend', 'coroutine', 'async', 'flow', 'launch', 'await'],
    contextSnippets: [
      'suspend functions can pause without blocking. They are the building blocks.',
      'CoroutineScope manages lifecycle. Use viewModelScope in Android, lifecycleScope in Compose.',
      'launch for fire-and-forget. async/await for results. Use awaitAll for parallel work.',
      'Flow is cold stream. Use flowOf() for known values, flow {} for builder syntax.',
      'Operators: map, filter, take, drop. Terminal: collect, toList, first, single.',
      'Use channel for event streams. Use SharedFlow for state, StateFlow for UI state.',
    ],
    triggerPatterns: {
      extensions: ['.kt', '.kts'],
      filenames: [],
      contentPatterns: ['suspend ', 'CoroutineScope', 'launch {', 'async {', 'Flow<', 'flow {'],
    },
  },
];
