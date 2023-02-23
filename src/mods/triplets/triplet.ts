import { Preparable } from "@hazae41/binary"
import { Type } from "mods/type/type.js"

export interface Typed {
  type: Type
}

export interface ToStringable {
  toString(): string
}

export interface Triplet {
  type: Type
  DER: Preparable
  toString(): string
}