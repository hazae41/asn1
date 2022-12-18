import { Binary } from "@hazae41/binary";
import { assert, test } from "@hazae41/phobos";
import { DER } from "mods/der.js";
import { Sequence } from "mods/triplets/sequence/sequence.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".cjs", ".ts")))

function hexToBinary(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Buffer.from(hex2, "hex")
  return new Binary(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToBinary(hex)
  const triplet = Sequence.read(input, DER.read)

  const output = Binary.allocUnsafe(triplet.size())
  triplet.write(output)

  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("30 0D 06 09 2A 86 48 86 F7 0D 01 01 01 05 00"))
})