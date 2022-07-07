export class PatternNotFoundError extends Error {
  pattern: string;
  path: string;

  constructor(pattern: string, path: string) {
    super(`Pattern ${pattern} not found in '${path}'`);
    this.pattern = pattern;
    this.path = path;
  }
}

const grep = async (path: string, pattern: string) => {
  const cmd = ['grep', '-R', pattern, path];
  const process = Deno.run({
    cmd,
    stdout: 'piped',
  });
  const { code } = await process.status();

  process.stdout.close();
  process.close();

  if (code !== 0) {
    throw new PatternNotFoundError(pattern, path);
  }
};

export default grep;
