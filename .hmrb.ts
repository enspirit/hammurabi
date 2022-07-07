import { fsExists } from './src/assertions/fs.ts'

Deno.test("Makefile exists", async () => {
  await fsExists('Makefile')
})
