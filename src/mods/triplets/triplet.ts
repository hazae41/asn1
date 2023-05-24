import { Writable } from "@hazae41/binary"
import { Type } from "mods/type/type.js"

export type DERWritable = Writable<never, unknown>

export interface Triplet {
  type: Type
  toDER(): DERWritable
  toString(): string
}

export interface DERTriplet<Output extends DERWritable> extends Triplet {
  toDER(): Output
}