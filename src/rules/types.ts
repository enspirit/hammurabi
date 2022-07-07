import MonoRepo from '../monorepo.ts';

export interface RuleResult {
  name: string,
  errors: Array<Error>,
  warnings: Array<string>
  success: Array<string>
}

export interface IRule {
  validateConfig(): Promise<void> | Promise<Error>;

  run(monorepo: MonoRepo): Promise<RuleResult>;
}
