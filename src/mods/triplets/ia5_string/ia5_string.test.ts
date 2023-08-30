import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Result } from "@hazae41/result";
import { DER } from "mods/resolvers/der.js";
import { relative, resolve } from "node:path";
import { IA5String } from "./ia5_string.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

Result.debug = true

function hexToCursor(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Bytes.fromHex(hex2)
  return new Cursor(buffer)
}

function checkReadWrite(hex: string) {
  const input = hexToCursor(hex)
  const triplet = IA5String.DER.tryRead(input).unwrap()

  const output = DER.tryWriteToBytes(triplet).unwrap()
  return input.buffer.equals(output)
}

test("Read then write", async () => {
  assert(checkReadWrite("0C 0C 54 65 73 74 20 65 64 32 35 35 31 39"))
})