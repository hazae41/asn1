import { Base16 } from "@hazae41/base16";
import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { PrintableString } from "mods/triplets/printable_string/printable_string.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))



function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.get().getOrThrow().padStartAndDecodeOrThrow(hex2).bytes
  return new Cursor(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const triplet = PrintableString.DER.readOrThrow(input)

  const output = Writable.writeToBytesOrThrow(triplet)
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("13 0E 44 53 54 20 52 6F 6F 74 20 43 41 20 58 33"))
})