import { Binary } from "@hazae41/binary";
import { assert, test } from "@hazae41/phobos";
import { Boolean } from "mods/triplets/boolean/boolean.js";
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
  const triplet = Boolean.read(input)

  const output = Binary.allocUnsafe(triplet.size())
  triplet.write(output)

  return input.buffer.equals(output.buffer)
}

test("Read then write", async () => {
  assert(checkReadWrite("01 01 00"))
  assert(checkReadWrite("01 01 01"))
  assert(checkReadWrite("01 01 FF"))
})