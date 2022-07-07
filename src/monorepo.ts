import {
  fsExists,
  fsExpandGlob,
  pathJoin,
} from './deps.ts';
import { getComponents, ComponentCollection } from './components.ts'

export default class Monorepo {
  #baseDir;
  #components: ComponentCollection | null;

  constructor(baseDir = Deno.cwd()) {
    this.#baseDir = baseDir;
    this.#components = null;
  }

  relativePath(path: string) {
    return pathJoin(this.#baseDir, path);
  }

  async readTextFile(path: string) {
    return await Deno.readTextFile(this.relativePath(path));
  }

  async ensureFileExists(path: string): Promise<string> {
    const filePath = this.relativePath(path);
    const exists = await fsExists(filePath);
    if (!exists) {
      throw new Error(`Cannot find file ${filePath}.`);
    }
    return filePath;
  }

  async dirExists(path: string): Promise<boolean> {
    return await fsExists(this.relativePath(path))
  }

  async getComponents() {
    if (!this.#components) {
      this.#components = await getComponents(this.relativePath('docker-compose.base.yml'));
    }
    return this.#components;
  }

  expandGlob(glob: string) {
    return fsExpandGlob(this.relativePath(glob));
  }

  static async fromDir(baseDir: string) {
    const monorepo = new Monorepo(baseDir);
    await monorepo.ensureFileExists('./Makefile');
    await monorepo.ensureFileExists('./config.mk');
    await monorepo.ensureFileExists('./docker-compose.base.yml');
    return monorepo;
  }
}
