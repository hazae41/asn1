import { Cursor } from "@hazae41/cursor";
import { Opaque } from "mods/triplets/opaque/opaque.js";

export namespace DER {

  export function readOrThrow(cursor: Cursor) {
    return Opaque.DER.readOrThrow(cursor).resolveOrThrow()
  }

}