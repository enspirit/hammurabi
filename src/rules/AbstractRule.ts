import { IRule, RuleResult } from './types.ts';
import MonoRepo from '../monorepo.ts';

export default abstract class AbstractRule implements IRule {
  #config;

  constructor(config?: unknown) {
    this.#config = config;
  }

  get config() {
    return this.#config;
  }

  abstract validateConfig(): Promise<void> | Promise<Error>;

  abstract run(monorepo: MonoRepo): Promise<RuleResult>;
}
