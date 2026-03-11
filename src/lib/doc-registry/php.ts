import type { DocEntry } from '@/types';

export const phpDocEntries: DocEntry[] = [
  {
    id: 'php-psr',
    language: 'PHP',
    label: 'PSR Standards',
    description: 'PSR-12 coding style, autoloading',
    officialUrl: 'https://www.php-fig.org/psr/psr-12/',
    keywords: ['class', 'namespace', 'use', 'interface', 'trait', 'extends'],
    contextSnippets: [
      'Use PSR-12 coding standard: 4 spaces for indent, opening brace on new line for classes.',
      'Namespaces required. Use PSR-4 autoloading with Composer.',
      'Use declare(strict_types=1) for strict typing. Always use it.',
      'Class names in PascalCase. Methods and properties in camelCase.',
      'Use type hints everywhere. Return types required in PHP 8+.',
      'Use readonly properties for immutable state.',
    ],
    triggerPatterns: {
      extensions: ['.php'],
      filenames: ['composer.json'],
      contentPatterns: ['<?php', 'namespace ', 'use ', 'class ', 'function '],
    },
  },
  {
    id: 'php-modern',
    language: 'PHP',
    label: 'PHP 8 Features',
    description: 'Attributes, match, union types, named args',
    officialUrl: 'https://www.php.net/manual/en/migration80.new-features.php',
    keywords: ['match', 'union', 'attribute', 'named', 'readonly', 'never'],
    contextSnippets: [
      'Attributes replace docblocks for metadata. Use #[ORM\Entity] syntax.',
      'Match expression replaces switch. It returns values and has exhaustive checking.',
      'Union types: int|string, nullable: ?int or int|null. Use mixed sparingly.',
      'Named arguments: func(order: "asc", limit: 10). Skip optional params.',
      'Readonly properties cannot be modified after initialization.',
      'Never return type for functions that never return (throw or exit).',
    ],
    triggerPatterns: {
      extensions: ['.php'],
      filenames: [],
      contentPatterns: ['#[', 'match (', 'readonly ', 'never '],
    },
  },
];
