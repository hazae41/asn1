import { Base16 } from "@hazae41/base16";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Result } from "@hazae41/result";
import { DER } from "mods/resolvers/der.js";
import { OctetString } from "mods/triplets/octet_string/octet_string.js";
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

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const triplet = OctetString.DER.tryRead(input).unwrap()

  const output = DER.tryWriteToBytes(triplet).unwrap()
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("04 63 30 61 30 2E 06 08 2B 06 01 05 05 07 30 01 86 22 68 74 74 70 3A 2F 2F 6F 63 73 70 2E 69 6E 74 2D 78 33 2E 6C 65 74 73 65 6E 63 72 79 70 74 2E 6F 72 67 30 2F 06 08 2B 06 01 05 05 07 30 02 86 23 68 74 74 70 3A 2F 2F 63 65 72 74 2E 69 6E 74 2D 78 33 2E 6C 65 74 73 65 6E 63 72 79 70 74 2E 6F 72 67 2F"))
})