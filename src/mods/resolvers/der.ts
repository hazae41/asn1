import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Triplet } from "index.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Type } from "mods/type/type.js";

export interface DERTriplet extends Triplet, Writable {
  readonly type: Type.DER
}

export namespace DER {

  export function readOrThrow(cursor: Cursor) {
    return Opaque.DER.readOrThrow(cursor).resolveOrThrow()
  }

}