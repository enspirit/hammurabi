import {
  assertInstanceOf,
  assertMatch,
  assertRejects,
  expect,
} from './deps.ts'

import Monorepo from '../src/monorepo.ts';

const MONOREPO_PATH = Deno.env.get("MONOREPO_PATH");

Deno.test("Monorepo is a class", async (t) => {

  await t.step('is a class', () => {
    assertInstanceOf(new Monorepo(MONOREPO_PATH), Monorepo)
  })

  await t.step('.fromDir', async (t) => {

    await t.step('it returns an instance of Monorepo', async (t) => {
      const instance = await Monorepo.fromDir(MONOREPO_PATH || '../');
      assertInstanceOf(instance, Monorepo);
    });

    await t.step('when provided with a baseDir arg', async (t) => {

      await t.step('fails when path does not point to a monorepo', async () => {
        const err = await assertRejects(() => Monorepo.fromDir('/tmp'), Error)
        assertMatch(err.message, /Cannot find file .*Makefile/)
      });

    });
  })

  await t.step('#getComponents()', async (t) => {

    const repo = await Monorepo.fromDir(MONOREPO_PATH || '../');

    await t.step('it works as expected', async () => {
      const components = await repo.getComponents();
      expect(Object.keys(components)).toHaveLength(12);
      expect(components).toHaveProperty('api-rb');
      expect(components).toHaveProperty('api-rb.engine');
      expect(components).toHaveProperty('frontend');
    });

  });


});
