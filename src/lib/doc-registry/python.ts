import type { DocEntry } from '@/types';

export const pythonDocEntries: DocEntry[] = [
  {
    id: 'python-pep8',
    language: 'Python',
    label: 'PEP 8 Style Guide',
    description: 'Code style, naming conventions, indentation',
    officialUrl: 'https://peps.python.org/pep-0008/',
    keywords: ['pep8', 'style', 'naming', 'indentation', 'whitespace', 'import'],
    contextSnippets: [
      'Use 4 spaces per indentation level. No tabs. Limit lines to 79 characters.',
      'Name classes in CapWords, functions in snake_case, constants in UPPER_SNAKE_CASE.',
      'Imports should be on separate lines: stdlib, third-party, local.',
      'Use descriptive names. Avoid single characters except in loops.',
      'Two blank lines between top-level definitions, one between method definitions.',
      'Spaces around operators and after commas, but not inside parentheses.',
    ],
    triggerPatterns: {
      extensions: ['.py'],
      filenames: [],
      contentPatterns: ['def ', 'class ', 'import ', 'from '],
    },
  },
  {
    id: 'python-typing',
    language: 'Python',
    label: 'typing module',
    description: 'Type hints, generics, protocols',
    officialUrl: 'https://docs.python.org/3/library/typing.html',
    keywords: ['typing', 'TypeVar', 'Generic', 'Protocol', 'Optional', 'Union', 'List', 'Dict'],
    contextSnippets: [
      'Use type hints for function signatures. They improve IDE support and catch bugs.',
      'Use Optional[X] instead of Union[X, None]. Use Union for multiple types.',
      'TypeVar creates generic types: T = TypeVar("T"). Bound with T = TypeVar("T", bound=Base).',
      'Protocol defines structural subtyping. Classes dont need to declare they implement it.',
      'Use @overload for functions with multiple type signatures.',
      'Use typing.Final for constants that should not be reassigned.',
    ],
    triggerPatterns: {
      extensions: ['.py'],
      filenames: ['pyproject.toml', 'setup.py'],
      contentPatterns: ['typing.', ': str', ': int', '-> ', 'List[', 'Dict[', 'Optional['],
    },
  },
  {
    id: 'python-async',
    language: 'Python',
    label: 'asyncio',
    description: 'Async/await, event loops, coroutines',
    officialUrl: 'https://docs.python.org/3/library/asyncio.html',
    keywords: ['async', 'await', 'asyncio', 'coroutine', 'event loop', 'task'],
    contextSnippets: [
      'Use async def for coroutines. Use await to call other coroutines.',
      'asyncio.run() is the main entry point. It creates an event loop and runs the coroutine.',
      'Use asyncio.create_task() to schedule concurrent tasks. Gather results with asyncio.gather().',
      'Never call blocking I/O in async code. Use asyncio.to_thread() or async libraries.',
      'Use asyncio.Lock() for synchronization, asyncio.Queue() for producer-consumer patterns.',
      'Use async with for context managers that need cleanup.',
    ],
    triggerPatterns: {
      extensions: ['.py'],
      filenames: [],
      contentPatterns: ['async def', 'await ', 'asyncio.', 'async with', 'async for'],
    },
  },
];
