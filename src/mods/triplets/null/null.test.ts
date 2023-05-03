import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { DER } from "mods/der.js";
import { Null } from "mods/triplets/null/null.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Bytes.fromHex(hex2)
  return new Cursor(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToCursor("05 00")
  const triplet = Null.DER.tryRead(input).unwrap()

  const output = DER.tryWriteToBytes(triplet).unwrap()
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("05 00"))
})