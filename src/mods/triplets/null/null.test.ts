import { assert } from "libs/assert/assert.js";
import { Binary } from "libs/binary/binary.js";
import { Null } from "mods/triplets/null/null.js";
import { relative, resolve } from "node:path";
import { test } from "uvu";

test.before(async () => {
  const directory = resolve("./dist/test/")
  const { pathname } = new URL(import.meta.url)
  console.log(relative(directory, pathname.replace(".cjs", ".ts")))
})

function hexToBinary(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Buffer.from(hex2, "hex")
  return new Binary(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToBinary("05 00")
  const output = Binary.allocUnsafe(input.buffer.length)
  Null.read(input).write(output)
  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("05 00"))
})

test.run()