import { fsExists, yamlParse } from './deps.ts';

export interface Component {
  name: string;
  image: string;
  envFiles: Array<string>;
}

export interface DockerComposeService {
  image: string;
  env_file: Array<string>;
}

export interface DockerCompose {
  services: { [key: string]: DockerComposeService };
}

export interface ComponentCollection {
  [key: string]: Component;
}

// find components that are part of the base architecture (= meant to be running in production envs)
export const getComponents = async (
  composeFile = 'docker-compose.base.yml',
): Promise<ComponentCollection> => {
  // Ensure we can find the helm chart for the flair project... if not this script is used incorrectly
  if (!await fsExists(composeFile)) {
    throw new Error(`Unable to find ${composeFile}`);
  }

  const dockerCompose: DockerCompose = yamlParse(
    await Deno.readTextFile(composeFile),
  ) as DockerCompose;

  return Object.entries(dockerCompose.services)
    .reduce((components: ComponentCollection, [svcName, svc]) => {
      components[svcName] = {
        name: svcName,
        image: svc.image,
        envFiles: svc.env_file,
      };
      return components;
    }, {});
};
