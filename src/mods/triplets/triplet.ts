import { Writable } from "@hazae41/binary"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export interface Triplet {
  type: Type
  toDER(): Triplet & Writable
  toString(): string
}

export namespace Triplet {

  export function sizeOrThrow(length: Length.DER) {
    return Type.DER.size + length.sizeOrThrow() + length.value
  }

}