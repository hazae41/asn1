import { Binary } from "libs/binary/binary.js"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export interface Typed {
  type: Type
}

export interface Lengthed {
  length: Length
}

export interface Sizeable {
  size(): number
}

export interface Writeable {
  write(binary: Binary): void
}

export interface ToStringable {
  toString(): string
}

export type Triplet =
  & Typed
  & Lengthed
  & Writeable
  & Sizeable
  & ToStringable

export namespace Triplet {

  export function size(length: Length) {
    return Type.size() + length.size() + length.value
  }

}