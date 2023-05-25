import { BinaryWriteError, Writable } from "@hazae41/binary"
import { Ok, Result } from "@hazae41/result"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export type DERWritable = Writable<never, BinaryWriteError>

export interface Triplet {
  type: Type
  toDER(): DERWritable
  toString(): string
}

export namespace Triplet {

  export function trySize(length: Length.DER): Result<number, never> {
    return new Ok(Type.DER.size + length.trySize().get() + length.value)
  }

}