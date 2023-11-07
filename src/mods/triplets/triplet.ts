import { DERTriplet } from "index.js"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export interface Triplet {
  readonly type: Type
  toDER(): DERTriplet
  toString(): string
}

export namespace Triplet {

  export function sizeOrThrow(length: Length.DER) {
    return Type.DER.size + length.sizeOrThrow() + length.value
  }

}