import { Base16 } from "@hazae41/base16";
import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Result } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

Result.debug = true

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.get().tryPadStartAndDecode(hex2).unwrap().copy()
  return new Cursor(buffer)
}

function hexToLength(hex: string) {
  const cursor = hexToCursor(hex)
  const length = Length.DER.tryRead(cursor).unwrap()
  return length.value
}

test("Read", async () => {
  assert(hexToLength("82 01 7F") === 383)
  assert(hexToLength("82 04 92") === 1170)
})

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const length = Length.DER.tryRead(input).unwrap()

  const output = Writable.tryWriteToBytes(length.toDER()).unwrap()
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("82 01 7F"))
  assert(checkReadWrite("82 04 92"))
})