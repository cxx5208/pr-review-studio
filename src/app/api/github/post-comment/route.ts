import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { kv, userKeys } from '@/lib/kv';
import { decrypt } from '@/lib/encryption';
import { parseGitHubPrUrl } from '@/lib/pr-url';
import { z } from 'zod';

const postCommentSchema = z.object({
  prUrl: z.string().url(),
  comment: z.string().min(1).max(65000),
  asReviewComment: z.boolean().optional().default(false),
  fileComments: z.array(z.object({
    path: z.string(),
    line: z.number(),
    body: z.string(),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = postCommentSchema.parse(body);

    const parsed = parseGitHubPrUrl(validated.prUrl);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid PR URL' }, { status: 400 });
    }

    const userProfile = await kv.get<{ githubAccessToken: string }>(userKeys.profile(session.user.id));
    
    if (!userProfile?.githubAccessToken) {
      return NextResponse.json({ error: 'GitHub token not found. Please reconnect your GitHub account.' }, { status: 401 });
    }

    let githubToken: string;
    try {
      githubToken = decrypt(userProfile.githubAccessToken);
    } catch {
      return NextResponse.json({ error: 'Failed to decrypt GitHub token' }, { status: 500 });
    }

    const octokit = new Octokit({ auth: githubToken });

    try {
      if (validated.asReviewComment && validated.fileComments && validated.fileComments.length > 0) {
        const { data: pullRequest } = await octokit.pulls.get({
          owner: parsed.owner,
          repo: parsed.repo,
          pull_number: parsed.prNumber,
        });

        const commitId = pullRequest.head.sha;

        for (const fileComment of validated.fileComments) {
          await octokit.pulls.createReviewComment({
            owner: parsed.owner,
            repo: parsed.repo,
            pull_number: parsed.prNumber,
            body: fileComment.body,
            commit_id: commitId,
            path: fileComment.path,
            line: fileComment.line,
          });
        }

        return NextResponse.json({ success: true, message: 'Review comments posted', commentCount: validated.fileComments.length });
      } else {
        await octokit.issues.createComment({
          owner: parsed.owner,
          repo: parsed.repo,
          issue_number: parsed.prNumber,
          body: validated.comment,
        });

        return NextResponse.json({ success: true, message: 'Comment posted to PR' });
      }
    } catch (githubError) {
      console.error('GitHub API error:', githubError);
      return NextResponse.json({ error: 'Failed to post comment to GitHub. The token may lack required permissions.' }, { status: 403 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    console.error('Post comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
