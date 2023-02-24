import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { assert, test } from "@hazae41/phobos";
import { Sequence } from "mods/triplets/sequence/sequence.js";
import { Type } from "mods/type/type.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

function hexToType(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Bytes.fromHex(hex2)
  return Type.DER.read(new Cursor(buffer))
}

test("Read", async () => {
  assert(hexToType("30").inner.equals(Sequence.type))
})