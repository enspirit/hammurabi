import { dirExists, fileExists } from '../../../assertions/fs.ts';
import { pathJoin } from '../../../deps.ts';
import { Component } from '../../../utils/makefile.ts';
import { ChartDependency, getHelmDependencies } from '../../../utils/helm.ts';
import grep from '../../../utils/grep.ts';
import { assert } from '../../../deps.ts';

export interface HelmChart {
  getDependencies(): Promise<Array<ChartDependency>>;
  subchart(name: string, fn?: (chart: HelmChart) => void): void;
  grep(str: string, msg?: string): void;
  hasDependency(name: string): void;
  hasFile(name: string): void;
}

const helmChartHelper = (path: string, t: Deno.TestContext): HelmChart => {
  let dependencies;
  return {
    async getDependencies() {
      return dependencies ||= await getHelmDependencies(path);
    },
    async subchart(name: string, fn?: (chart: HelmChart) => void) {
      await tester(t, pathJoin(path, 'charts', name), fn);
    },
    async grep(str: string, msg?: string) {
      const assertMsg = msg || `It contains string: ${str}`;
      await t.step(
        assertMsg,
        async () => {
          try {
            await grep(`${path}/`, str);
          } catch (err) {
            assert(false, err.message);
          }
        },
      );
    },
    async hasDependency(name: string) {
      const assertMsg = `has a dependency on ${name}`;
      await t.step(
        assertMsg,
        async () => {
          const deps = await this.getDependencies();
          const dep = deps.find((d: ChartDependency) => d.name === name);
          assert(dep, assertMsg);
        },
      );
    },
    async hasFile(fname: string) {
      const fpath = pathJoin(path, fname);
      await t.step(
        `has a ${fname}`,
        async () => {
          await fileExists(fpath);
        },
      );
    },
  };
};

const tester = async (
  t: Deno.TestContext,
  path: string,
  fn?: (chart: HelmChart) => void,
) => {
  const assertMsg = `The ${path} helm chart`;
  await t.step(assertMsg, async (t) => {
    const chart = helmChartHelper(path, t);
    await chart.hasFile('Chart.yaml');
    if (fn) {
      await fn(chart);
    }
  });
};

export default tester;
