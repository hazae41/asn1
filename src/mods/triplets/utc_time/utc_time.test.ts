import { Base16 } from "@hazae41/base16";
import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { UTCTime } from "mods/triplets/utc_time/utc_time.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))



function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.get().getOrThrow().padStartAndDecodeOrThrow(hex2).bytes
  return new Cursor(buffer)
}

function hexToDate(hex: string) {
  const input = hexToCursor(hex)
  return UTCTime.DER.readOrThrow(input).value.toUTCString()
}

function reformatDate(text: string) {
  const date = new Date(text)
  return date.toUTCString()
}

test("Read", async () => {
  assert(hexToDate("17 0D 31 39 30 39 32 39 31 36 33 33 33 36 5A") === reformatDate("2019-09-29 16:33:36 UTC"))
  assert(hexToDate("17 0D 31 39 31 32 32 38 31 36 33 33 33 36 5A") === reformatDate("2019-12-28 16:33:36 UTC"))
})

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const triplet = UTCTime.DER.readOrThrow(input)

  const output = Writable.writeToBytesOrThrow(triplet)
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("17 0D 31 39 30 39 32 39 31 36 33 33 33 36 5A"))
  assert(checkReadWrite("17 0D 31 39 31 32 32 38 31 36 33 33 33 36 5A"))
  assert(checkReadWrite("17 0D 30 37 31 32 30 37 31 30 32 31 34 36 5A"))
})