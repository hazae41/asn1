import { Readable } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { assert, test } from "@hazae41/phobos";
import { DER } from "mods/der.js";
import { Integer } from "mods/triplets/integer/integer.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

function hexToBytes(hex: string) {
  return Bytes.fromHex(hex.replaceAll(" ", ""))
}

function bytesToTriplet(bytes: Uint8Array) {
  return Readable.tryReadFromBytes(Integer.DER, bytes).unwrap()
}

function hexToTriplet(hex: string) {
  return bytesToTriplet(hexToBytes(hex))
}

test("Read", async () => {
  assert(hexToTriplet("02 01 00").value === BigInt(0))
  assert(hexToTriplet("02 02 30 39").value === BigInt(12345))
  assert(hexToTriplet("02 12 03 D4 15 31 8E 2C 57 1D 29  05 FC 3E 05 27 68 9D 0D 09").value === BigInt("333504890676592408951587385614406537514249"))
  assert(hexToTriplet("02 01 64").value === BigInt(100))
  assert(hexToTriplet("02 01 9C").value === BigInt(-100))
  assert(hexToTriplet("02 02 00 FF").value === BigInt(255))
  assert(hexToTriplet("02 01 80").value === BigInt(-128))
  assert(hexToTriplet("02 05 80 00 00 00 01").value === BigInt("-549755813887"))
})

function checkReadWrite(hex: string) {
  const input = hexToBytes(hex)
  const triplet = bytesToTriplet(input)
  const output = DER.tryWriteToBytes(triplet).unwrap()
  return Bytes.equals(input, output)
}

test("Read then write", async () => {
  assert(checkReadWrite("02 01 00"))
  assert(checkReadWrite("02 02 30 39"))
  assert(checkReadWrite("02 12 03 D4 15 31 8E 2C 57 1D 29  05 FC 3E 05 27 68 9D 0D 09"))
  assert(checkReadWrite("02 01 64"))
  assert(checkReadWrite("02 01 9C"))
  assert(checkReadWrite("02 02 00 FF"))
  assert(checkReadWrite("02 01 80"))
  assert(checkReadWrite("02 05 80 00 00 00 01"))
})
