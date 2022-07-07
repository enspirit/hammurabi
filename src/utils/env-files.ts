import { dotEnvParser } from '../deps.ts';

export interface EnvVars {
  [key: string]: string | number;
}

export const loadEnvVars = async (
  file: string | Array<string>,
): Promise<EnvVars> => {
  const files = Array.isArray(file) ? file : [file];

  const vars = {};
  for await (const file of files) {
    const content = await Deno.readTextFile(file);
    const envVars = dotEnvParser(content);
    Object.assign(vars, envVars);
  }
  return Promise.resolve(vars);
};
