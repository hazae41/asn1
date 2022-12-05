import { assert } from "libs/assert/assert.js";
import { Binary } from "libs/binary/binary.js";
import { UTF8String } from "mods/utf8_string/utf8_string.js";
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
  UTF8String.fromDER(input).toDER(output)
  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("0C 0C 54 65 73 74 20 65 64 32 35 35 31 39"))
})

test.run()