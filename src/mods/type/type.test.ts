import { Base16 } from "@hazae41/base16";
import { Cursor } from "@hazae41/cursor";
import { assert, test } from "@hazae41/phobos";
import { Sequence } from "mods/triplets/sequence/sequence.js";
import { Type } from "mods/type/type.js";
import { relative, resolve } from "node:path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))



function hexToType(hex: string) {
  const hex2 = hex.replaceAll(" ", "")
  const buffer = Base16.get().getOrThrow().padStartAndDecodeOrThrow(hex2).bytes
  return Type.DER.readOrThrow(new Cursor(buffer))
}

test("Read", async () => {
  assert(hexToType("30").equals(Sequence.DER.type))
})