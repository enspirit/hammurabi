import { dirExists } from '../../../assertions/fs.ts';
import { DockerComposeService } from '../../../utils/docker-compose.ts';
import { EnvVars, loadEnvVars } from '../../../utils/env-files.ts';
import { assert } from '../../../deps.ts';

interface ServiceTester extends DockerComposeService {
  hasEnvFile(name: string | RegExp): void;
}

const serviceHelper = (
  svc: DockerComposeService,
  t: Deno.TestContext,
): ServiceTester => {
  return {
    ...svc,
    getAllEnvVars: svc.getAllEnvVars,
    async hasEnvFile(name: string | RegExp) {
      const assertMsg = `uses an env file such as ${name}`;
      await t.step(
        assertMsg,
        () => {
          const envFile = svc.envFiles.find((f) => {
            return name instanceof RegExp ? f.match(name) : f === name;
          });
          assert(envFile, assertMsg);
        },
      );
    },
  };
};

export default async (
  t: Deno.TestContext,
  svc: DockerComposeService,
  fn?: (svc: ServiceTester) => void,
) => {
  const { name } = svc;
  const assertMsg = `The ${name} service`;
  await t.step(assertMsg, async (t) => {
    const service = serviceHelper(svc, t);
    if (fn) {
      await fn(service);
    }
  });
};
