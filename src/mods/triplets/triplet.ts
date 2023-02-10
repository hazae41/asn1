import { Binary } from "@hazae41/binary"
import { Type } from "mods/type/type.js"

export interface Typed {
  type: Type
}

export interface Sizeable {
  size(): number
}

export interface Writeable {
  write(cursor: Binary): void
}

export interface ToStringable {
  toString(): string
}

export type Triplet =
  & Typed
  & Writeable
  & Sizeable
  & ToStringable