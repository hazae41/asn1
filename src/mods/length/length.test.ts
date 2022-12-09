import { assert } from "libs/assert/assert.js";
import { Binary } from "libs/binary/binary.js";
import { Length } from "mods/length/length.js";
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

function hexToLength(hex: string) {
  const binary = hexToBinary(hex)
  const length = Length.read(binary)
  return length.value
}

test("Read", async () => {
  assert(hexToLength("82 01 7F") === 383)
  assert(hexToLength("82 04 92") === 1170)
})

function checkReadWrite(hex: string) {
  const input = hexToBinary(hex)
  const length = Length.read(input)

  const output = Binary.allocUnsafe(length.size())
  length.write(output)

  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("82 01 7F"))
  assert(checkReadWrite("82 04 92"))
})

test.run()