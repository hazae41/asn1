import { BinaryWriteError, Writable } from "@hazae41/binary"
import { Type } from "mods/type/type.js"

export type DERWritable = Writable<never, BinaryWriteError>

export interface Triplet {
  type: Type
  toDER(): DERWritable
  toString(): string
}