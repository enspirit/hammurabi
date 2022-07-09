const {default: monorepo} = await import(`../src/rules/enspirit/monorepo.ts`);

/// RULE
`
Rule: all docker components must have a dockerignore that ignores both makefile.mk and their Dockerfile(s)

Why:  it ensures that docker's cache can be used in an optimal way and avoid long(er) builds
`
const dockerComponentIgnoresProperlyFiles = async (cmp) => {
  await cmp.hasDockerignore();
  await cmp.itDockerignores('makefile.mk');
  await cmp.itDockerignores('Dockerfile*');
}

/// RULE
`
Rule: This rule ensures that all components defined in docker-compose.base.yml
      use a "base.env" env_file that lists the env variables that are potentially
      used in production environments.

Why:  this is a way to naturally document all environment variables used
      by the software.
`
const dockerComposeServiceUsesBaseEnvFile = async (svc) => {
  await svc.hasEnvFile(/base\.env/);
}

// Run tests

await monorepo(async (repo) => {

  const services = await repo.getServices();
  const components = await repo.getComponents();

  for await (const svcName of Object.keys(services)) {
    await repo.service(svcName, async (svc) => {
      await dockerComposeServiceUsesBaseEnvFile(svc);
    });
  }

  for await (const cmpName of Object.keys(components)) {
    await repo.component(cmpName, async (cmp) => {
      await dockerComponentIgnoresProperlyFiles(cmp);
    });
  }
});
