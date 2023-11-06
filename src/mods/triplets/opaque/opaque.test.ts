import { Base16 } from "@hazae41/base16";
import { Readable, Writable } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { assert, test } from "@hazae41/phobos";
import { Result } from "@hazae41/result";
import { Integer } from "index.js";
import { DER } from "mods/resolvers/der.js";
import { relative, resolve } from "node:path";
import { Opaque } from "./opaque.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

Result.debug = true

function hexToBytes(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  return Base16.get().tryPadStartAndDecode(hex2).unwrap().copyAndDispose()
}

function bytesToTriplet(bytes: Uint8Array) {
  const opaque = Readable.readFromBytesOrThrow(DER, bytes)

  if (!(opaque instanceof Opaque))
    throw new Error(`Not an opaque`)
  if (opaque.type.tag !== 1)
    throw new Error(`Not a custom integer`)
  return opaque.tryReadInto(Integer.DER).unwrap()
}

function hexToTriplet(hex: string) {
  return bytesToTriplet(hexToBytes(hex))
}

test("Read", async () => {
  assert(hexToTriplet("41 01 00").value === BigInt(0))
  assert(hexToTriplet("41 02 30 39").value === BigInt(12345))
  assert(hexToTriplet("41 12 03 D4 15 31 8E 2C 57 1D 29  05 FC 3E 05 27 68 9D 0D 09").value === BigInt("333504890676592408951587385614406537514249"))
  assert(hexToTriplet("41 01 64").value === BigInt(100))
  assert(hexToTriplet("41 01 9C").value === BigInt(-100))
  assert(hexToTriplet("41 02 00 FF").value === BigInt(255))
  assert(hexToTriplet("41 01 80").value === BigInt(-128))
  assert(hexToTriplet("41 05 80 00 00 00 01").value === BigInt("-549755813887"))
})

function checkReadWrite(hex: string) {
  const input = hexToBytes(hex)
  const triplet = bytesToTriplet(input)
  const output = Writable.writeToBytesOrThrow(triplet)
  return Bytes.equals(input, output)
}

test("Read then write", async () => {
  assert(checkReadWrite("41 01 00"))
  assert(checkReadWrite("41 02 30 39"))
  assert(checkReadWrite("41 12 03 D4 15 31 8E 2C 57 1D 29  05 FC 3E 05 27 68 9D 0D 09"))
  assert(checkReadWrite("41 01 64"))
  assert(checkReadWrite("41 01 9C"))
  assert(checkReadWrite("41 02 00 FF"))
  assert(checkReadWrite("41 01 80"))
  assert(checkReadWrite("41 05 80 00 00 00 01"))
})
