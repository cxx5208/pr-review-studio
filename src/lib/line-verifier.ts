import type { PRFile } from '@/types';

export interface LineReference {
  file: string;
  line: number | null;
  context: string;
}

export interface VerifiedReference extends LineReference {
  isValid: boolean;
  warning?: string;
}

const LINE_NUMBER_PATTERN = /(?:file[:\s]+)?([a-zA-Z0-9_\-./]+\.[a-zA-Z]+)(?:[:\s]+)?(?:line[:\s]+)?(\d+)(?:\s|$)/gi;

export function extractLineReferences(text: string): LineReference[] {
  const references: LineReference[] = [];
  let match;
  
  while ((match = LINE_NUMBER_PATTERN.exec(text)) !== null) {
    const file = match[1];
    const line = parseInt(match[2], 10);
    
    if (file && line && line > 0) {
      references.push({
        file,
        line,
        context: text.substring(Math.max(0, match.index - 50), match.index + 50),
      });
    }
  }
  
  return references;
}

export function verifyLineReferences(
  references: LineReference[],
  files: PRFile[]
): VerifiedReference[] {
  const fileMap = new Map<string, PRFile>();
  
  for (const file of files) {
    const normalizedName = file.filename.toLowerCase().replace(/^\//, '');
    fileMap.set(normalizedName, file);
    
    const parts = file.filename.split('/');
    if (parts.length > 1) {
      fileMap.set(parts[parts.length - 1].toLowerCase(), file);
    }
  }
  
  return references.map(ref => {
    const normalizedFile = ref.file.toLowerCase().replace(/^\//, '');
    const matchedFile = fileMap.get(normalizedFile);
    
    if (!matchedFile) {
      return {
        ...ref,
        isValid: false,
        warning: `File "${ref.file}" not found in PR diff`,
      };
    }
    
    const maxLine = (matchedFile.patch?.split('\n').length || 0);
    if (ref.line && (ref.line < 1 || ref.line > maxLine)) {
      return {
        ...ref,
        isValid: false,
        warning: `Line ${ref.line} is out of range for ${matchedFile.filename} (max: ${maxLine})`,
      };
    }
    
    return {
      ...ref,
      isValid: true,
    };
  });
}

export function addVerificationWarnings(reviewText: string, files: PRFile[]): string {
  const references = extractLineReferences(reviewText);
  if (references.length === 0) return reviewText;
  
  const verified = verifyLineReferences(references, files);
  const invalidRefs = verified.filter(r => !r.isValid);
  
  if (invalidRefs.length === 0) return reviewText;
  
  const warningSection = `\n\n---\n⚠️ **Line Number Verification Notes:**\n${
    invalidRefs.map(r => `- ${r.file}:${r.line} - ${r.warning}`).join('\n')
  }\n*Some line numbers could not be verified against the current diff.*`;
  
  return reviewText + warningSection;
}

export function extractFileLinePairs(text: string): Array<{ file: string; line: number }> {
  const pairs: Array<{ file: string; line: number }> = [];
  const references = extractLineReferences(text);
  
  for (const ref of references) {
    if (ref.line) {
      pairs.push({ file: ref.file, line: ref.line });
    }
  }
  
  return pairs;
}
