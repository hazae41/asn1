import { Writable } from "@hazae41/binary"
import { Type } from "mods/type/type.js"

export type DERWritable = Writable<never, Error>

export interface Triplet {
  type: Type
  toDER(): DERWritable
  toString(): string
}

export interface DERTriplet<Output extends DERWritable = DERWritable> extends Triplet {
  toDER(): DERTriplet.Output<this>
}

export namespace DERTriplet {
  export type Output<T extends DERTriplet> = T extends DERTriplet<infer Output> ? Output : never
}