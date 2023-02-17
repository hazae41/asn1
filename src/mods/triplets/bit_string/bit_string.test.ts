import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { assert, test } from "@hazae41/phobos";
import { BitString } from "mods/triplets/bit_string/bit_string.js";
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
  const input = hexToCursor(hex)
  const triplet = BitString.read(input)

  const output = Cursor.allocUnsafe(triplet.size())
  triplet.write(output)

  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("03 41 00 6F 73 77 BE 28 96 5A 33 36 D7 E5 34 FD 90 F3 FD 40 7F 1F 02 F9 00 57 F2 16 0F 16 6B 04 BF 65 84 B6 98 D2 D0 D2 BF 4C D6 6F 0E B6 E2 E8 9D 04 A3 E0 99 50 F9 C2 6D DE 73 AD 1D 35 57 85 65 86 06"))
})