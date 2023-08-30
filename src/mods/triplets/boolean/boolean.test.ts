import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Result } from "@hazae41/result";
import { DER } from "mods/resolvers/der.js";
import { Boolean } from "mods/triplets/boolean/boolean.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

Result.debug = true

function hexToCursor(hex: string) {
  return new Cursor(Bytes.fromHex(hex.replaceAll(" ", "")))
}

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const triplet = Boolean.DER.tryRead(input).unwrap()

  const output = DER.tryWriteToBytes(triplet).unwrap()
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("01 01 00"))
  assert(checkReadWrite("01 01 01"))
  assert(checkReadWrite("01 01 FF"))
})