import { Type } from "mods/type/type.js"

export interface Typed {
  type: Type
}

export interface ToStringable {
  toString(): string
}