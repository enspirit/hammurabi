export interface Component {
  name: string;
  context: string;
  dockerfile: string;
  deps: Array<string>;
}

export interface ComponentCollection {
  [key: string]: Component;
}

const makeTarget = async (target: string): Promise<string> => {
  const p = await Deno.run({
    cmd: ['make', target],
    stdout: 'piped',
  });
  await p.status();
  const output = new TextDecoder().decode(await p.output());
  p.close();
  return output;
};

const makePrint = async (varName: string): Promise<string> => {
  const output = await makeTarget(`print-${varName}`);
  return output.trim();
};

const getVariable = async (varName: string) => await makePrint(varName);

const getArray = async (varName: string) =>
  (await getVariable(varName)).split(' ');

// find components that are part of the monorepo
export const getComponents = async (): Promise<ComponentCollection> => {
  const csv = await makeTarget('inspect');
  const lines = csv.split('\n').filter((l) => l);

  const header = lines.shift();
  if (!header) {
    throw new Error(
      'Unable to inspect makefile for components. make inspect returned wrong format',
    );
  }

  const keys = header.split('|');
  const components: Array<Component> = lines.map((line) => {
    const values = line.split('|');
    return keys.reduce((cmp: any, key: string) => {
      cmp[key] = values.shift() as string;
      return cmp;
    }, {});
  });

  return components.reduce((cmps: any, cmp) => {
    cmps[cmp.name] = cmp;
    return cmps;
  }, {});
};
