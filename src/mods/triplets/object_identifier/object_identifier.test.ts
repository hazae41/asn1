import { Binary } from "@hazae41/binary";
import { assert, test } from "@hazae41/phobos";
import { ObjectIdentifier } from "mods/triplets/object_identifier/object_identifier.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".cjs", ".ts")))

function hexToBinary(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Buffer.from(hex2, "hex")
  return new Binary(buffer)
}

function checkReadWriteOID(hex: string) {
  const input = hexToBinary(hex)
  const triplet = ObjectIdentifier.read(input)

  const output = Binary.allocUnsafe(triplet.size())
  triplet.write(output)

  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWriteOID("06 09 2A 86 48 86 F7 0D 01 01 0B"))
  assert(checkReadWriteOID("06 03 55 04 0A"))
})