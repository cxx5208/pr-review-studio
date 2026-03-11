import type { DocEntry } from '@/types';
import { goDocEntries } from './doc-registry/go';
import { typescriptDocEntries } from './doc-registry/typescript';
import { pythonDocEntries } from './doc-registry/python';
import { rubyDocEntries } from './doc-registry/ruby';
import { rustDocEntries } from './doc-registry/rust';
import { javaDocEntries } from './doc-registry/java';
import { kotlinDocEntries } from './doc-registry/kotlin';
import { swiftDocEntries } from './doc-registry/swift';
import { csharpDocEntries } from './doc-registry/csharp';
import { phpDocEntries } from './doc-registry/php';
import { elixirDocEntries } from './doc-registry/elixir';
import { javascriptDocEntries } from './doc-registry/javascript';

export interface LanguageConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  extensions: string[];
  docEntries: DocEntry[];
}

export const languageRegistry: Record<string, LanguageConfig> = {
  go: {
    id: 'go',
    name: 'Go',
    color: '#00ADD8',
    icon: '🐹',
    extensions: ['.go'],
    docEntries: goDocEntries,
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    color: '#3178C6',
    icon: '📘',
    extensions: ['.ts', '.tsx'],
    docEntries: typescriptDocEntries,
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    color: '#F7DF1E',
    icon: '📜',
    extensions: ['.js', '.jsx', '.mjs'],
    docEntries: javascriptDocEntries,
  },
  python: {
    id: 'python',
    name: 'Python',
    color: '#3776AB',
    icon: '🐍',
    extensions: ['.py', '.pyw'],
    docEntries: pythonDocEntries,
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    color: '#CC342D',
    icon: '💎',
    extensions: ['.rb'],
    docEntries: rubyDocEntries,
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    color: '#DEA584',
    icon: '🦀',
    extensions: ['.rs'],
    docEntries: rustDocEntries,
  },
  java: {
    id: 'java',
    name: 'Java',
    color: '#ED8B00',
    icon: '☕',
    extensions: ['.java'],
    docEntries: javaDocEntries,
  },
  kotlin: {
    id: 'kotlin',
    name: 'Kotlin',
    color: '#7F52FF',
    icon: '🧊',
    extensions: ['.kt', '.kts'],
    docEntries: kotlinDocEntries,
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    color: '#FA7343',
    icon: '🍎',
    extensions: ['.swift'],
    docEntries: swiftDocEntries,
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    color: '#239120',
    icon: '🔷',
    extensions: ['.cs'],
    docEntries: csharpDocEntries,
  },
  php: {
    id: 'php',
    name: 'PHP',
    color: '#777BB4',
    icon: '🐘',
    extensions: ['.php'],
    docEntries: phpDocEntries,
  },
  elixir: {
    id: 'elixir',
    name: 'Elixir',
    color: '#6E4A7E',
    icon: '⚗️',
    extensions: ['.ex', '.exs'],
    docEntries: elixirDocEntries,
  },
};

export const supportedLanguages = Object.values(languageRegistry);

export function getLanguageByExtension(ext: string): LanguageConfig | undefined {
  const normalized = ext.toLowerCase();
  return supportedLanguages.find(lang => 
    lang.extensions.includes(normalized)
  );
}

export function detectLanguagesFromFiles(files: Array<{ filename: string; additions: number; deletions: number }>): Array<{ lang: string; confidence: number; filesChanged: number }> {
  const langCounts: Record<string, { count: number; lines: number }> = {};
  
  for (const file of files) {
    const ext = '.' + file.filename.split('.').pop()?.toLowerCase();
    const lang = getLanguageByExtension(ext);
    if (lang) {
      const lines = file.additions + file.deletions;
      if (!langCounts[lang.id]) {
        langCounts[lang.id] = { count: 0, lines: 0 };
      }
      langCounts[lang.id].count++;
      langCounts[lang.id].lines += lines;
    }
  }
  
  const totalFiles = Object.values(langCounts).reduce((sum, v) => sum + v.count, 0);
  const totalLines = Object.values(langCounts).reduce((sum, v) => sum + v.lines, 0);
  
  return Object.entries(langCounts)
    .map(([langId, { count, lines }]) => ({
      lang: langId,
      confidence: totalFiles > 0 ? (count / totalFiles) * 0.6 + (lines / totalLines) * 0.4 : 0,
      filesChanged: count,
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

export function getDocEntriesForLanguage(langId: string): DocEntry[] {
  return languageRegistry[langId]?.docEntries || [];
}
