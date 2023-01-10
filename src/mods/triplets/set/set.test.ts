import { Binary } from "@hazae41/binary";
import { assert, test } from "@hazae41/phobos";
import { Bytes } from "libs/bytes/bytes.js";
import { DER } from "mods/der.js";
import { Set } from "mods/triplets/set/set.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".cjs", ".ts")))

function hexToBinary(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Bytes.fromHex(hex2)
  return new Binary(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToBinary(hex)
  const triplet = Set.read(input, DER.read)

  const output = Binary.allocUnsafe(triplet.size())
  triplet.write(output)

  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("31 18 30 16 06 03 55 04 03 13 0F 6C 65 74 73 65 6E 63 72 79 70 74 2E 6F 72 67"))
})