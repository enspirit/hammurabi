import { IRule } from './rules/types.ts';
export interface RuleConfig {
  rule: IRule;
  description: string;
}
export type Config = Array<RuleConfig>;
