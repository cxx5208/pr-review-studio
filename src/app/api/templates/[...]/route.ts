import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { kv, userKeys } from '@/lib/kv';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

interface Template {
  id: string;
  name: string;
  badge?: string;
  color?: string;
  description: string;
  systemPrompt: string;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersion {
  version: number;
  systemPrompt: string;
  savedAt: string;
}

const TEMPLATE_VERSIONS_LIMIT = 5;

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  badge: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(1).max(5000),
  cloneFromId: z.string().optional(),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  badge: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(1).max(5000).optional(),
});

const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: 'staff-engineer',
    name: 'Staff Engineer',
    badge: 'SR',
    color: '#6c47ff',
    description: 'Architecture, scalability, system design, org patterns',
    systemPrompt: `You are performing a code review as a Staff Engineer.
Focus on:
- Architecture and system design decisions
- Scalability considerations
- Design patterns and their appropriate use
- Technical debt identification
- Performance implications

Provide direct, strategic feedback. Be concise but thorough.`,
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'senior-engineer',
    name: 'Senior Engineer',
    badge: 'SE',
    color: '#22c55e',
    description: 'Logic, edge cases, performance, security',
    systemPrompt: `You are performing a code review as a Senior Engineer.
Focus on:
- Correctness and edge cases
- Performance considerations
- Security vulnerabilities
- Error handling
- Code organization

Provide thorough, precise feedback.`,
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'junior-friendly',
    name: 'Junior Friendly',
    badge: 'JR',
    color: '#f59e0b',
    description: 'Correctness, readability, learning opportunities',
    systemPrompt: `You are performing a code review with a focus on helping junior engineers learn.
Focus on:
- Explaining why patterns are used
- Suggesting improvements with clear reasoning
- Highlighting good practices to reinforce
- Simplifying complex logic when possible

Be encouraging and educational in your feedback.`,
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'security-audit',
    name: 'Security Audit',
    badge: 'SEC',
    color: '#ef4444',
    description: 'OWASP Top 10, injection, auth, data exposure',
    systemPrompt: `You are performing a security-focused code review.
Focus on:
- Authentication and authorization issues
- Injection vulnerabilities (SQL, XSS, command)
- Data exposure and privacy
- Cryptography usage
- Input validation

Be clinical and thorough. Prioritize findings by severity.`,
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'quick-scan',
    name: 'Quick Scan',
    badge: 'QS',
    color: '#9896b0',
    description: 'Obvious bugs, style, clear wins only',
    systemPrompt: `You are performing a quick code review.
Focus on:
- Obvious bugs and critical mistakes
- Clear code style violations
- Low-hanging performance fruit
- Simple improvements with big impact

Be concise. Skip minor style nits unless critical.`,
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

async function getUserTemplates(userId: string): Promise<Template[]> {
  const ids = await kv.lrange<string>(userKeys.templates(userId), 0, -1);
  if (!ids || ids.length === 0) return [];
  
  const templates: Template[] = [];
  for (const id of ids) {
    const template = await kv.get<Template>(`template:${userId}:${id}`);
    if (template) templates.push(template);
  }
  return templates;
}

async function saveTemplateVersion(userId: string, template: Template): Promise<void> {
  const versionKey = `template:${userId}:${template.id}:versions`;
  const existingVersions = await kv.lrange<TemplateVersion>(versionKey, 0, -1);
  
  const newVersion: TemplateVersion = {
    version: existingVersions.length + 1,
    systemPrompt: template.systemPrompt,
    savedAt: new Date().toISOString(),
  };
  
  await kv.lpush(versionKey, newVersion);
  await kv.ltrim(versionKey, 0, TEMPLATE_VERSIONS_LIMIT - 1);
}

async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { pathname, searchParams } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean);
    const templateId = segments[segments.length - 1];

    if (templateId && templateId !== 'templates') {
      if (session?.user?.id) {
        const userTemplate = await kv.get<Template>(`template:${session.user.id}:${templateId}`);
        if (userTemplate !== null) {
          return NextResponse.json(userTemplate);
        }
      }
      const builtIn = BUILT_IN_TEMPLATES.find(t => t.id === templateId);
      if (builtIn) return NextResponse.json(builtIn);
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const templates = [...BUILT_IN_TEMPLATES];
    if (session?.user?.id) {
      const userTemplates = await getUserTemplates(session.user.id);
      templates.push(...userTemplates);
    }

    const type = searchParams.get('type');
    if (type === 'builtin') {
      return NextResponse.json(BUILT_IN_TEMPLATES);
    }
    if (type === 'custom' && session?.user?.id) {
      return NextResponse.json(await getUserTemplates(session.user.id));
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error('GET templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createTemplateSchema.parse(body);

    let template: Template;

    if (validated.cloneFromId) {
      let source: Template | undefined;
      source = BUILT_IN_TEMPLATES.find(t => t.id === validated.cloneFromId);
      if (!source) {
        const userSource = await kv.get<Template>(`template:${session.user.id}:${validated.cloneFromId}`);
        if (userSource !== null) source = userSource;
      }
      if (!source) {
        return NextResponse.json({ error: 'Template to clone not found' }, { status: 404 });
      }
      template = {
        ...source,
        id: uuid(),
        name: validated.name || `${source.name} (Copy)`,
        badge: validated.badge,
        color: validated.color,
        description: validated.description || source.description,
        systemPrompt: validated.systemPrompt || source.systemPrompt,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      template = {
        id: uuid(),
        name: validated.name,
        badge: validated.badge,
        color: validated.color,
        description: validated.description || '',
        systemPrompt: validated.systemPrompt,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    await kv.set(`template:${session.user.id}:${template.id}`, template);
    await kv.lpush(userKeys.templates(session.user.id), template.id);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('POST template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean);
    const templateId = segments[segments.length - 1];

    if (!templateId || templateId === 'templates') {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const existing = await kv.get<Template>(`template:${session.user.id}:${templateId}`);
    if (existing === null) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateTemplateSchema.parse(body);

    await saveTemplateVersion(session.user.id, existing);

    const updated: Template = {
      ...existing,
      ...validated,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`template:${session.user.id}:${templateId}`, updated);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('PUT template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean);
    const templateId = segments[segments.length - 1];

    if (!templateId || templateId === 'templates') {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const existing = await kv.get<Template>(`template:${session.user.id}:${templateId}`);
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (existing.isBuiltIn) {
      return NextResponse.json({ error: 'Cannot delete built-in templates' }, { status: 403 });
    }

    await kv.del(`template:${session.user.id}:${templateId}`);
    await kv.lrem(userKeys.templates(session.user.id), 0, templateId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
