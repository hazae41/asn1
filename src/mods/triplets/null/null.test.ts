import { Base16 } from "@hazae41/base16";
import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Null } from "mods/triplets/null/null.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))



function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.padStartAndDecodeOrThrow(hex2)
  return new Cursor(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToCursor("05 00")
  const triplet = Null.DER.readOrThrow(input)

  const output = Writable.writeToBytesOrThrow(triplet)
  return Buffer.from(input.bytes).equals(Buffer.from(output))
}

test("Read then write", async () => {
  assert(checkReadWrite("05 00"))
})