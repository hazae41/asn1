import { DERTriplet } from "mods/resolvers/der/triplet.js"
import { Type } from "mods/type/type.js"

export interface Triplet {
  readonly type: Type
  toDER(): DERTriplet
  toString(): string
}