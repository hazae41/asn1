import { Base16 } from "@hazae41/base16";
import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Result } from "@hazae41/result";
import { VLQ } from "mods/variable_length_quantity/variable_length_quantity.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

Result.debug = true

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.get().tryPadStartAndDecode(hex2).unwrap().copyAndDispose()
  return new Cursor(buffer)
}

function hexToVLQ(hex: string) {
  const cursor = hexToCursor(hex)
  return VLQ.DER.readOrThrow(cursor).value
}

test("Read", async () => {
  assert(hexToVLQ("00") === 0)
  assert(hexToVLQ("7F") === 127)
  assert(hexToVLQ("81 00") === 128)
  assert(hexToVLQ("C0 00") === 8192)
  assert(hexToVLQ("FF 7F") === 16383)
  assert(hexToVLQ("81 80 00") === 16384)
  assert(hexToVLQ("FF FF 7F") === 2097151)
  assert(hexToVLQ("81 80 80 00") === 2097152)
  assert(hexToVLQ("C0 80 80 00") === 134217728)
  assert(hexToVLQ("FF FF FF 7F") === 268435455)
})

function checkReadWriteVLQ(hex: string) {
  const input = hexToCursor(hex)
  const vlq = VLQ.DER.readOrThrow(input)

  const output = Writable.writeToBytesOrThrow(vlq)
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWriteVLQ("00"))
  assert(checkReadWriteVLQ("7F"))
  assert(checkReadWriteVLQ("81 00"))
  assert(checkReadWriteVLQ("C0 00"))
  assert(checkReadWriteVLQ("FF 7F"))
  assert(checkReadWriteVLQ("81 80 00"))
  assert(checkReadWriteVLQ("FF FF 7F"))
  assert(checkReadWriteVLQ("81 80 80 00"))
  assert(checkReadWriteVLQ("C0 80 80 00"))
  assert(checkReadWriteVLQ("FF FF FF 7F"))
})