import { Base16 } from "@hazae41/base16";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Result } from "@hazae41/result";
import { DER } from "mods/resolvers/der.js";
import { relative, resolve } from "node:path";
import { Sequence } from "./sequence.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

Result.debug = true

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.get().tryPadStartAndDecode(hex2).unwrap().copy()
  return new Cursor(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const triplet = DER.tryRead(input).unwrap()

  assert(triplet instanceof Sequence)

  const output = DER.tryWriteToBytes(triplet).unwrap()
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("30 0D 06 09 2A 86 48 86 F7 0D 01 01 01 05 00"))
})