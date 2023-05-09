import { Writable } from "@hazae41/binary"
import { Type } from "mods/type/type.js"

export interface Triplet {
  type: Type
  toDER(): Writable<never, unknown>
  toString(): string
}

export interface TripletToDER<WriteError> {
  type: Type
  toDER(): Writable<never, WriteError>
  toString(): string
}