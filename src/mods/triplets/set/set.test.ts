import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { assert, test } from "@hazae41/phobos";
import { DER } from "mods/der.js";
import { relative, resolve } from "node:path";
import { Set } from "./set.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Bytes.fromHex(hex2)
  return new Cursor(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const triplet = DER.read(input)

  assert(triplet instanceof Set)

  const output = Cursor.allocUnsafe(triplet.size())
  triplet.write(output)

  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("31 18 30 16 06 03 55 04 03 13 0F 6C 65 74 73 65 6E 63 72 79 70 74 2E 6F 72 67"))
})