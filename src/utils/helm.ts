import { fsExists, pathJoin, yamlParse } from '../deps.ts';

export interface ChartDependency {
  name: string;
  repository: string;
  version: string;
}

export interface ChartYamlFile {
  dependencies: Array<ChartDependency>;
}

// find components that are part of the base architecture (= meant to be running in production envs)
export const getHelmDependencies = async (
  chartPath: string,
): Promise<Array<ChartDependency>> => {
  const chartYamlPath = pathJoin(chartPath, 'Chart.yaml');

  if (!await fsExists(chartYamlPath)) {
    throw new Error(`Unable to find file: ${chartYamlPath}`);
  }

  const chartDef = yamlParse(
    await Deno.readTextFile(chartYamlPath),
  ) as ChartYamlFile;

  return chartDef.dependencies;
};
