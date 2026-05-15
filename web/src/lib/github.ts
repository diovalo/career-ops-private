/**
 * GitHub Contents API client for reading/writing applications.md
 * Uses environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
 */

interface FileResponse {
  content: string;
  sha: string;
}

function getGitHubConfig(): {
  token: string;
  owner: string;
  repo: string;
  branch: string;
} {
  return {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

/**
 * Fetch a file from GitHub and return its content (decoded from base64) and SHA
 */
export async function getFile(filePath: string): Promise<FileResponse> {
  const config = getGitHubConfig();

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `token ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as {
    content: string;
    sha: string;
  };

  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  return { content, sha: data.sha };
}

/**
 * Like getFile but returns null instead of throwing when the file doesn't exist (404)
 */
export async function getFileOrNull(filePath: string): Promise<FileResponse | null> {
  const config = getGitHubConfig();

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `token ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { content: string; sha: string };
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

/**
 * Write a file to GitHub with the given content and commit message
 * Requires the SHA of the current file (for update) or empty string (for new file)
 */
export async function putFile(
  filePath: string,
  content: string,
  sha: string,
  message: string
): Promise<void> {
  const config = getGitHubConfig();

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  const encodedContent = Buffer.from(content).toString('base64');

  const payload = {
    message,
    content: encodedContent,
    sha: sha || undefined, // omit if empty
    branch: config.branch,
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `GitHub API error: ${response.status} ${JSON.stringify(errorData)}`
    );
  }
}
