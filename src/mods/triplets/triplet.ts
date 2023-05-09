import { Writable } from "@hazae41/binary"
import { Type } from "mods/type/type.js"

export interface Typed {
  type: Type
}

export interface ToStringable {
  toString(): string
}

export interface Triplet {
  type: Type
  toDER(): Writable<never, unknown>
  toString(): string
}

export interface ToDER<WriteError> {
  toDER(): Writable<never, WriteError>
}