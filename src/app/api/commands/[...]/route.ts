import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { kv, userKeys } from '@/lib/kv';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

interface Command {
  id: string;
  trigger: string;
  description: string;
  promptFragment: string;
  conflictGroup?: string;
  languages?: string[];
  isBuiltIn: boolean;
  createdAt: string;
}

const BUILT_IN_COMMANDS: Command[] = [
  {
    id: 'check-patterns',
    trigger: 'check-patterns',
    description: 'Flag deviations from common design patterns',
    promptFragment: 'Pay special attention to design patterns. Look for opportunities to use established patterns like Factory, Builder, Strategy, Repository, etc. Note any pattern violations or anti-patterns.',
    conflictGroup: 'verbosity',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'api-contract',
    trigger: 'api-contract',
    description: 'Verify backwards compatibility of API changes',
    promptFragment: 'Focus on API contracts. Check for breaking changes in function signatures, response formats, error codes. Verify semantic versioning if applicable.',
    conflictGroup: 'focus',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'test-coverage',
    trigger: 'test-coverage',
    description: 'Identify logic paths with missing tests',
    promptFragment: 'Analyze test coverage. Flag areas with complex logic that lack test cases. Identify edge cases that may not be covered.',
    conflictGroup: 'focus',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'performance',
    trigger: 'performance',
    description: 'Focus on algorithmic complexity and I/O',
    promptFragment: 'Analyze performance implications. Look for O(n²) or worse algorithms, N+1 queries, unnecessary loops, memory allocations in hot paths. Suggest optimizations.',
    conflictGroup: 'focus',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'accessibility',
    trigger: 'accessibility',
    description: 'For frontend PRs, check ARIA and keyboard nav',
    promptFragment: 'Focus on accessibility (a11y). Check for proper ARIA labels, keyboard navigation support, color contrast issues, screen reader compatibility. Apply WCAG guidelines.',
    conflictGroup: 'focus',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const createCommandSchema = z.object({
  trigger: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1).max(200),
  promptFragment: z.string().min(1).max(2000),
  conflictGroup: z.string().max(50).optional(),
  languages: z.array(z.string()).optional(),
});

const updateCommandSchema = z.object({
  trigger: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(1).max(200).optional(),
  promptFragment: z.string().min(1).max(2000).optional(),
  conflictGroup: z.string().max(50).optional(),
  languages: z.array(z.string()).optional(),
});

function detectConflicts(commands: Command[]): Array<{ group: string; commands: string[] }> {
  const groupMap = new Map<string, string[]>();
  
  for (const cmd of commands) {
    if (cmd.conflictGroup) {
      const existing = groupMap.get(cmd.conflictGroup) || [];
      existing.push(cmd.trigger);
      groupMap.set(cmd.conflictGroup, existing);
    }
  }
  
  return Array.from(groupMap.entries())
    .filter(([_, cmds]) => cmds.length > 1)
    .map(([group, cmds]) => ({ group, commands: cmds }));
}

async function getUserCommands(userId: string): Promise<Command[]> {
  const ids = await kv.lrange<string>(userKeys.commands(userId), 0, -1);
  if (!ids || ids.length === 0) return [];
  
  const commands: Command[] = [];
  for (const id of ids) {
    const cmd = await kv.get<Command>(`command:${userId}:${id}`);
    if (cmd) commands.push(cmd);
  }
  return commands;
}

async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { pathname, searchParams } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean);
    const commandId = segments[segments.length - 1];

    if (commandId && commandId !== 'commands') {
      if (session?.user?.id) {
        const userCommand = await kv.get<Command>(`command:${session.user.id}:${commandId}`);
        if (userCommand !== null) {
          return NextResponse.json(userCommand);
        }
      }
      const builtIn = BUILT_IN_COMMANDS.find(c => c.id === commandId);
      if (builtIn) return NextResponse.json(builtIn);
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    const commands = [...BUILT_IN_COMMANDS];
    if (session?.user?.id) {
      const userCommands = await getUserCommands(session.user.id);
      commands.push(...userCommands);
    }

    const type = searchParams.get('type');
    if (type === 'builtin') {
      return NextResponse.json(BUILT_IN_COMMANDS);
    }
    if (type === 'custom' && session?.user?.id) {
      return NextResponse.json(await getUserCommands(session.user.id));
    }

    return NextResponse.json(commands);
  } catch (error) {
    console.error('GET commands error:', error);
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
    const validated = createCommandSchema.parse(body);

    const userCommands = await getUserCommands(session.user.id);
    const existingTrigger = userCommands.find(c => c.trigger === validated.trigger);
    if (existingTrigger) {
      return NextResponse.json({ error: 'Command with this trigger already exists' }, { status: 400 });
    }

    if (validated.conflictGroup) {
      const conflicts = detectConflicts([
        ...userCommands.filter(c => c.conflictGroup === validated.conflictGroup),
        { id: 'new', trigger: validated.trigger, description: validated.description, promptFragment: validated.promptFragment, conflictGroup: validated.conflictGroup, isBuiltIn: false, createdAt: '' },
      ]);
      if (conflicts.length > 0) {
        return NextResponse.json({ 
          error: 'Conflict detected', 
          conflicts,
          message: `This command conflicts with other commands in the "${validated.conflictGroup}" group`
        }, { status: 409 });
      }
    }

    const command: Command = {
      id: uuid(),
      trigger: validated.trigger,
      description: validated.description,
      promptFragment: validated.promptFragment,
      conflictGroup: validated.conflictGroup,
      languages: validated.languages,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`command:${session.user.id}:${command.id}`, command);
    await kv.lpush(userKeys.commands(session.user.id), command.id);

    return NextResponse.json(command, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('POST command error:', error);
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
    const commandId = segments[segments.length - 1];

    if (!commandId || commandId === 'commands') {
      return NextResponse.json({ error: 'Command ID required' }, { status: 400 });
    }

    const existing = await kv.get<Command>(`command:${session.user.id}:${commandId}`);
    if (existing === null) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    if (existing.isBuiltIn) {
      return NextResponse.json({ error: 'Cannot modify built-in commands' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateCommandSchema.parse(body);

    const updated: Command = {
      ...existing,
      ...validated,
    };

    await kv.set(`command:${session.user.id}:${commandId}`, updated);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('PUT command error:', error);
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
    const commandId = segments[segments.length - 1];

    if (!commandId || commandId === 'commands') {
      return NextResponse.json({ error: 'Command ID required' }, { status: 400 });
    }

    const existing = await kv.get<Command>(`command:${session.user.id}:${commandId}`);
    if (existing === null) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    if (existing.isBuiltIn) {
      return NextResponse.json({ error: 'Cannot delete built-in commands' }, { status: 403 });
    }

    await kv.del(`command:${session.user.id}:${commandId}`);
    await kv.lrem(userKeys.commands(session.user.id), 0, commandId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE command error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
