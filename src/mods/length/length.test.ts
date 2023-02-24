import { Cursor, Preparable } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { assert, test } from "@hazae41/phobos";
import { Length } from "mods/length/length.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Bytes.fromHex(hex2)
  return new Cursor(buffer)
}

function hexToLength(hex: string) {
  const cursor = hexToCursor(hex)
  const length = Length.DER.read(cursor)
  return length.value
}

test("Read", async () => {
  assert(hexToLength("82 01 7F") === 383)
  assert(hexToLength("82 04 92") === 1170)
})

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const length = Length.DER.read(input)

  const output = Preparable.toBytes(length.toDER())
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("82 01 7F"))
  assert(checkReadWrite("82 04 92"))
})