import { fileExists } from '../../assertions/fs.ts';
import component from './monorepo/component.ts';
import service from './monorepo/service.ts';
import chart from './monorepo/helm-chart.ts';

import {
  DockerComposeService,
  DockerComposeServiceCollection,
  getServices as dcGetServices,
} from '../../utils/docker-compose.ts';
import {
  Component,
  ComponentCollection,
  getComponents as mkGetComponents,
} from '../../utils/makefile.ts';

export interface MonoRepo {
  getServices(): Promise<DockerComposeServiceCollection>;
  getComponents(): Promise<ComponentCollection>;
  component(name: string, fn: (cmp: Component) => void): void;
  service(name: string, fn: (svc: DockerComposeService) => void): void;
  helmChart(name: string, fn: () => void): void;
}

const monorepoHelper = (t: Deno.TestContext): MonoRepo => {
  let services, components;

  return {
    getServices() {
      return services ||= dcGetServices('docker-compose.base.yml');
    },
    getComponents() {
      return components ||= mkGetComponents();
    },
    async component(name: string, fn: (cmp: Component) => void) {
      const components = await this.getComponents();
      const cmp = components[name];
      if (!cmp) {
        throw new Error(`Unknown component ${name}`);
      }
      await component(t, cmp, fn);
    },
    async service(name: string, fn: (svc: DockerComposeService) => void) {
      const svcs = await this.getServices();
      const svc = svcs[name];
      if (!svc) {
        throw new Error(`Unknown service ${name}`);
      }
      await service(t, svc, fn);
    },
    async helmChart(name: string, fn: () => void) {
      await chart(t, name, fn);
    },
  };
};

export default async (fn: (repo: MonoRepo) => void) => {
  const assertMsg = `The monorepo`;
  await Deno.test({
    name: assertMsg,
    fn: async (t: Deno.TestContext) => {
      const hasFile = async (fname: string) =>
        await t.step(`has the ${fname}`, async () => {
          await fileExists(fname);
        });

      await hasFile('Makefile');
      await hasFile('config.mk');
      await hasFile('docker-compose.base.yml');

      const repo = await monorepoHelper(t);
      await fn(repo);
    },
  });
};
