import type { DocEntry } from '@/types';

export const rubyDocEntries: DocEntry[] = [
  {
    id: 'ruby-style',
    language: 'Ruby',
    label: 'Ruby Style Guide',
    description: 'Code style, conventions, best practices',
    officialUrl: 'https://rubystyle.guide/',
    keywords: ['class', 'module', 'method', 'block', 'lambda', 'proc'],
    contextSnippets: [
      'Use two spaces for indentation. No tabs.',
      'Class names in CamelCase, methods and variables in snake_case.',
      'Prefer symbols over strings for keys. Use immutable patterns where possible.',
      'Use Ruby 3.x patterns: pattern matching, rbs type signatures, fiber scheduler.',
      'Blocks should have meaningful names. Use Kernel#then for transformation pipelines.',
      'Avoid monkey-patching core classes unless its a well-known gem pattern.',
    ],
    triggerPatterns: {
      extensions: ['.rb'],
      filenames: ['Gemfile', 'Rakefile'],
      contentPatterns: ['def ', 'class ', 'module ', 'end', 'do ', '-> '],
    },
  },
  {
    id: 'ruby-rails',
    language: 'Ruby',
    label: 'Rails Guides',
    description: 'Rails patterns, MVC, ActiveRecord',
    officialUrl: 'https://guides.rubyonrails.org/',
    keywords: ['ActiveRecord', 'model', 'controller', 'view', 'migration', 'route'],
    contextSnippets: [
      'Fat models, skinny controllers. Business logic belongs in models or service objects.',
      'Use ActiveRecord scopes for reusable query fragments.',
      'Strong parameters in controllers. Never trust params directly.',
      'Migrations should be reversible. Use change_method or define up/down separately.',
      'Use concerns for shared behavior across models/controllers.',
      'Jobs belong in app/jobs. Use ActiveJob for abstraction.',
    ],
    triggerPatterns: {
      extensions: ['.rb'],
      filenames: [],
      contentPatterns: ['ApplicationRecord', 'ApplicationController', 'has_many', 'belongs_to'],
    },
  },
];
