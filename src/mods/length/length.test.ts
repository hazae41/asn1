import { Base16 } from "@hazae41/base16";
import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Length } from "mods/length/length.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.padStartAndDecodeOrThrow(hex2)
  return new Cursor(buffer)
}

function hexToLength(hex: string) {
  const cursor = hexToCursor(hex)
  const length = Length.DER.readOrThrow(cursor)
  return length.value
}

test("Read", async () => {
  assert(hexToLength("82 01 7F") === 383)
  assert(hexToLength("82 04 92") === 1170)
})

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const length = Length.DER.readOrThrow(input)

  const output = Writable.writeToBytesOrThrow(length)
  return Buffer.from(input.bytes).equals(Buffer.from(output))
}

test("Read then write", async () => {
  assert(checkReadWrite("82 01 7F"))
  assert(checkReadWrite("82 04 92"))
})