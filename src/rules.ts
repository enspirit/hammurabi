import Monorepo from './monorepo.ts';
import { Config } from './types.ts';
import { RuleResult } from './rules/types.ts';

export const runRules = async (
  monorepo: Monorepo,
  rules: Config,
): Promise<Array<RuleResult>> => {
  const ruleResults = [];

  for (const ruleConfig of rules) {
    const rule = ruleConfig.rule;
    try {
      await rule.validateConfig();
      const result = await rule.run(monorepo);
      ruleResults.push(result);
    } catch (err) {
      ruleResults.push({
        name: rule.constructor.name,
        errors: [err],
        success: [],
        warnings: [],
      });
    }
  }
  return ruleResults;
};
