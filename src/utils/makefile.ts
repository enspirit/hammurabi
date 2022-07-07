export interface Component {
  name: string;
  context: string;
  dockerfile: string;
}

export interface ComponentCollection {
  [key: string]: Component;
}

const makePrint = async (varName: string): Promise<string> => {
  const p = await Deno.run({
    cmd: ['make', `print-${varName}`],
    stdout: 'piped',
  });
  await p.status();
  const output = new TextDecoder().decode(await p.output());
  p.close();
  return output.trim();
};

const getVariable = async (varName: string) => await makePrint(varName);

const getArray = async (varName: string) =>
  (await getVariable(varName)).split(' ');

// find components that are part of the monorepo
export const getComponents = async (): Promise<ComponentCollection> => {
  const componentNames = await getArray('DOCKER_COMPONENTS');
  const promises = componentNames.map(
    async (name: string) => {
      const dockerfile = await getVariable(`${name}_DOCKER_FILE`);
      const context = await getVariable(`${name}_DOCKER_CONTEXT`);
      return {
        name,
        dockerfile,
        context,
      };
    },
  );
  const components = (await Promise.all(promises));

  return components.reduce((cmps: ComponentCollection, cmp) => {
    cmps[cmp.name] = cmp;
    return cmps;
  }, {});
};
