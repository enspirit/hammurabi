import { pathBasename } from '../../../deps.ts';
import AbstractRule from '../../AbstractRule.ts';
import MonoRepo from '../../../monorepo.ts';

export class MissingBaseEnvFile extends Error {
  constructor(envFile: string, component: string) {
    super(
      `Environment file '${envFile}' not setup properly for component '${component}'`,
    );
  }
}

export default class ComponentsHaveBaseEnvFile extends AbstractRule {
  validateConfig() {
    return Promise.resolve();
  }

  async run(monorepo: MonoRepo) {
    const components = await monorepo.getComponents();

    const errors: Array<Error> = [];
    const success: Array<string> = [];
    const warnings: Array<string> = [];

    Object.values(components).forEach((cmp) => {
      if (!cmp.envFiles) {
        return errors.push(
          new Error(`Component ${cmp.name} does not define any env_file!`),
        );
      }
      const envFile = cmp.envFiles.find((f) => pathBasename(f) === 'base.env');
      if (!envFile) {
        return errors.push(new MissingBaseEnvFile('base.env', cmp.name));
      }

      success.push(`${cmp.name} uses ${envFile} as base env file.`);
    });

    return { name: 'ComponentsHaveBaseEnvFile', errors, success, warnings };
  }
}
