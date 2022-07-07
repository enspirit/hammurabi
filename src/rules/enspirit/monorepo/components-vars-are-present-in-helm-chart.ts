import { dotEnvParser } from '../../../deps.ts';
import { default as grep, PatternNotFoundError } from '../../../utils/grep.ts';
import MonoRepo from '../../../monorepo.ts';
import AbstractRule from '../../AbstractRule.ts';

export class EnvVarNotFound extends Error {
  constructor(varName: string, component: string) {
    super(
      `Environment variable '${varName}' not found in helm chart for component '${component}'`,
    );
  }
}

export default class EnvFilesAndHelmChartMatch extends AbstractRule {
  get chartPath() {
    return this.config.chartPath;
  }

  validateConfig() {
    if (!this.chartPath) {
      return Promise.reject(Error('Missing config property: chartPath'));
    }
    return Promise.resolve();
  }

  async run(monorepo: MonoRepo) {
    const errors = [];
    const success: Array<string> = [];
    const warnings: Array<string> = [];

    const { chartPath } = this.config;

    const chartFound = await monorepo.dirExists(this.chartPath);
    if (!chartFound) {
      throw new Error(`Unable to find umbrella chart at ${this.chartPath}`);
    }

    for await (
      const component of Object.values(await monorepo.getComponents())
    ) {
      const { name: componentName, envFiles } = component;

      // Check if component has its own helm chart, warn the user if not
      const exists = await monorepo.dirExists(
        `${chartPath}/charts/${componentName}`,
      );
      if (!exists) {
        warnings.push(
          `Component ${componentName} does not have its own helm chart`,
        );
        continue;
      }

      for await (const envFile of envFiles || []) {
        const content = await monorepo.readTextFile(envFile);
        const envVars = dotEnvParser(content);

        // check if env var can be found in the general helm chart folder
        for await (const varName of Object.keys(envVars)) {
          try {
            await grep(
              monorepo.relativePath(`${chartPath}/charts/${componentName}`),
              varName,
            );
            success.push(
              `${varName} for component ${componentName} found in helm chart!`,
            );
          } catch (err) {
            if (err instanceof PatternNotFoundError) {
              errors.push(new EnvVarNotFound(varName, componentName));
            } else {
              errors.push(err);
            }
          }
        }
      }
    }

    return { name: 'EnvFilesAndHelmChartMatch', errors, success, warnings };
  }
}
