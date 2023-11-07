import { Writable } from "@hazae41/binary";
import { Length, Triplet } from "index.js";
import { Type } from "mods/type/type.js";

export interface DERTriplet extends Triplet, Writable {
  readonly type: Type.DER
}

export namespace DERTriplet {

  export function sizeOrThrow(length: Length.DER) {
    return Type.DER.size + length.sizeOrThrow() + length.value
  }

}