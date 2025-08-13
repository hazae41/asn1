import { Base16 } from "@hazae41/base16";
import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { relative, resolve } from "node:path";
import { GeneralizedTime } from "./generalized_time.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))



function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.padStartAndDecodeOrThrow(hex2)
  return new Cursor(buffer)
}

function hexToDate(hex: string) {
  const input = hexToCursor(hex)
  return GeneralizedTime.DER.readOrThrow(input).value.toUTCString()
}

function reformatDate(text: string) {
  const date = new Date(text)
  return date.toUTCString()
}

test("Read", async () => {
  assert(hexToDate("18 0f 31 39 39 31 30 35 30 36 32 33 34 35 34 30 5a") === reformatDate("1991-05-06 23:45:40 UTC"))
})

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const triplet = GeneralizedTime.DER.readOrThrow(input)

  const output = Writable.writeToBytesOrThrow(triplet)
  return Buffer.from(input.bytes).equals(Buffer.from(output))
}

test("Read then write", async () => {
  assert(checkReadWrite("18 0f 31 39 39 31 30 35 30 36 32 33 34 35 34 30 5a"))
})