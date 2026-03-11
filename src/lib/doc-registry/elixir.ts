import type { DocEntry } from '@/types';

export const elixirDocEntries: DocEntry[] = [
  {
    id: 'elixir-style',
    language: 'Elixir',
    label: 'Elixir Style Guide',
    description: 'Coding conventions, patterns',
    officialUrl: 'https://github.com/christopheradams/elixir_style_guide',
    keywords: ['defmodule', 'def', 'defp', 'module', 'function', 'pipe'],
    contextSnippets: [
      'Use two spaces for indentation. Modules in PascalCase, functions in snake_case.',
      'Prefer pipelines (|>) over nested function calls. They improve readability.',
      'Use pattern matching in function heads instead of conditionals.',
      'Use guards to add conditions to pattern matching.',
      'Use with for composing operations that may fail. It provides better error handling.',
      'Prefer structs over maps for data with known shape. Use protocols for polymorphism.',
    ],
    triggerPatterns: {
      extensions: ['.ex', '.exs'],
      filenames: ['mix.exs'],
      contentPatterns: ['defmodule ', 'def ', 'defp ', '|>', 'case '],
    },
  },
  {
    id: 'elixir-otp',
    language: 'Elixir',
    label: 'OTP',
    description: 'GenServer, Supervisor, Agents',
    officialUrl: 'https://elixir-lang.org/getting-started/mix-otp/supervisor-and-application.html',
    keywords: ['GenServer', 'Supervisor', 'Agent', 'Task', 'Registry', 'Process'],
    contextSnippets: [
      'GenServer handles state and message passing. Use callbacks: init, handle_call, handle_cast.',
      'Supervisor monitors children and restarts them on failure. Children return child specs.',
      'Use Agent for simple state. Use GenServer when you need async or complex state.',
      'Task is for fire-and-forget async work. Use Task.async/await for results.',
      'Registry provides name registration and lookup. Use for dynamic process names.',
      'DynamicSupervisor starts children dynamically. Use when children are added at runtime.',
    ],
    triggerPatterns: {
      extensions: ['.ex', '.exs'],
      filenames: [],
      contentPatterns: ['GenServer', 'Supervisor', 'Agent.', 'Task.async', 'Registry.'],
    },
  },
];
