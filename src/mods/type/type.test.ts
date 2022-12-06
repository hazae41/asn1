import { assert } from "libs/assert/assert.js";
import { Binary } from "libs/binary/binary.js";
import { Sequence } from "mods/triplets/sequence/sequence.js";
import { Type } from "mods/type/type.js";
import { relative, resolve } from "node:path";
import { test } from "uvu";

test.before(async () => {
  const directory = resolve("./dist/test/")
  const { pathname } = new URL(import.meta.url)
  console.log(relative(directory, pathname.replace(".cjs", ".ts")))
})

function hexToType(hex: string) {
  const buffer = Buffer.from(hex.replaceAll(" ", ""), "hex")
  return Type.read(new Binary(buffer))
}

test("Read", async () => {
  assert(hexToType("30").equals(Sequence.type))
})

test.run()