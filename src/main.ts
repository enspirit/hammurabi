import Monorepo from './monorepo.ts';
import { runRules } from './rules.ts';
import { Config } from './types.ts';
import { Command, pathJoin } from './deps.ts';

const runHammurabi = async (projectPath: string, config: Config) => {
  const monorepo = await Monorepo.fromDir(projectPath);
  const rulesErrors = await runRules(monorepo, config);

  let totalErrors = 0;
  let totalSuccess = 0;
  let totalWarnings = 0;

  rulesErrors.forEach((ruleResult) => {
    const log = ruleResult.errors.length ? console.error : console.info;
    log(`\n==== Rule ${ruleResult.name} triggered ${ruleResult.errors.length} errors (${ruleResult.success.length} success) ====`);
    totalErrors += ruleResult.errors.length;
    totalSuccess += ruleResult.success.length;
    totalWarnings += ruleResult.warnings.length;
    ruleResult.warnings.forEach(warning => log(`⚠ ${warning}`));
    ruleResult.errors.forEach(e => log(`X ${e.message}`));
  });

  const log = totalErrors > 0 ? console.error : console.log;
  log('\n------------------------------------------------------------------');
  log(`Total quality checks executed: ${totalErrors + totalSuccess}`);
  log(`Errors: ${totalErrors} - Warnings ${totalWarnings} - Success: ${totalSuccess}`);

  if (totalErrors > 0) {
    Deno.exit(1);
  }
}

await new Command()
  .name("hammurabi")
  .version("0.1.0")
  .description("Ensures your codebase follows a set of rules")
  .arguments("<config:string> [path:string]")
  .action(async (_, configPath:string, projectPath ?: string) => {
    projectPath = projectPath || Deno.cwd();
    let config;
    try {
      const modulePath = pathJoin(Deno.cwd(), configPath);
      console.log('Loading config from', modulePath);
      const configModule = await import(modulePath);
      config = configModule.default;
    } catch (err) {
      console.error('Unable to load config file:');
      throw err;
    }
    runHammurabi(projectPath, config);
  })
  .parse(Deno.args);


