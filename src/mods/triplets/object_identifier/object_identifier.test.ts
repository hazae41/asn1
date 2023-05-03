import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { DER } from "mods/der.js";
import { ObjectIdentifier } from "mods/triplets/object_identifier/object_identifier.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Bytes.fromHex(hex2)
  return new Cursor(buffer)
}

function checkReadWriteOID(hex: string) {
  const input = hexToCursor(hex)
  const triplet = ObjectIdentifier.DER.tryRead(input).unwrap()

  const output = DER.tryWriteToBytes(triplet).unwrap()
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWriteOID("06 09 2A 86 48 86 F7 0D 01 01 0B"))
  assert(checkReadWriteOID("06 03 55 04 0A"))
})