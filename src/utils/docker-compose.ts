import { fsExists, yamlParse } from '../deps.ts';
import { EnvVars, loadEnvVars } from './env-files.ts';
export class DockerComposeService {
  constructor(
    public name: string,
    public image: string,
    public envFiles: Array<string> = [],
  ) {}

  async getAllEnvVars(): Promise<EnvVars> {
    return await loadEnvVars(this.envFiles);
  }
}

export interface DockerComposeServiceDefinition {
  name: string;
  image: string;
  env_file: string | Array<string>;
}
export interface DockerComposeFile {
  services: { [key: string]: DockerComposeServiceDefinition };
}

export interface DockerComposeServiceCollection {
  [key: string]: DockerComposeService;
}

// find components that are part of the base architecture (= meant to be running in production envs)
export const getServices = async (
  composeFile = 'docker-compose.yml',
): Promise<DockerComposeServiceCollection> => {
  if (!await fsExists(composeFile)) {
    throw new Error(`Unable to find docker-compose file: ${composeFile}`);
  }

  const dockerCompose = yamlParse(
    await Deno.readTextFile(composeFile),
  ) as DockerComposeFile;

  return Object.entries(dockerCompose.services)
    .reduce((services: DockerComposeServiceCollection, [svcName, svc]) => {
      services[svcName] = new DockerComposeService(
        svcName,
        svc.image,
        Array.isArray(svc.env_file) ? svc.env_file : [svc.env_file],
      );
      return services;
    }, {});
};
