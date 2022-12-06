import { assert } from "libs/assert/assert.js";
import { Binary } from "libs/binary/binary.js";
import { PrintableString } from "mods/triplets/printable_string/printable_string.js";
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
  const input = hexToBinary(hex)
  const output = Binary.allocUnsafe(input.buffer.length)
  PrintableString.read(input).write(output)
  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("13 0E 44 53 54 20 52 6F 6F 74 20 43 41 20 58 33"))
})

test.run()