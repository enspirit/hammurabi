import { fileExists } from '../../../assertions/fs.ts';
import { Component } from '../../../utils/makefile.ts';
import grep from '../../../utils/grep.ts';
import { assert } from '../../../deps.ts';

export interface ComponentTester extends Component {
  itDockerignores(name: string): void;
  hasDockerignore(): void;
  definesDockerLabel(label: string, value?: string): void;
}

const componentHelper = (
  cmp: Component,
  t: Deno.TestContext,
): ComponentTester => {
  const { context } = cmp;
  return {
    ...cmp,
    async itDockerignores(name: string) {
      const assertMsg = `It .dockerignores the file ${name}`;
      await t.step(
        assertMsg,
        async () => {
          try {
            await grep(`${context}/.dockerignore`, name);
          } catch (err) {
            assert(false, err.message);
          }
        },
      );
    },
    async hasDockerignore() {
      await t.step(
        `has a .dockerignore (${context}/.dockerignore)`,
        async () => {
          await fileExists(`${context}/.dockerignore`);
        },
      );
    },
    async definesDockerLabel(label: string, value?: string) {
      await t.step(
        `defines the docker label ${label}${
          value ? `with value ${value}` : ''
        }`,
        async () => {
          let expr = `LABEL ${label}`;
          if (value) {
            expr = `${expr}=${value}`;
          }
          await grep(this.dockerfile, expr);
        },
      );
    },
  };
};

export default async (
  t: Deno.TestContext,
  cmp: Component,
  fn?: (cmp: ComponentTester) => void,
) => {
  const { name, context } = cmp;
  const assertMsg = `The ${name} component`;
  await t.step(assertMsg, async (t) => {
    await t.step(
      `has a Dockerfile (${cmp.dockerfile})`,
      async () => {
        await fileExists(cmp.dockerfile);
      },
    );

    const component = componentHelper(cmp, t);
    if (fn) {
      await fn(component);
    }
  });
};
