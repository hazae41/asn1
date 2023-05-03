import { Writable } from "@hazae41/binary"
import { Result } from "@hazae41/result"
import { Type } from "mods/type/type.js"

export interface Typed {
  type: Type
}

export interface ToStringable {
  toString(): string
}

export interface Triplet {
  type: Type
  tryToDER(): Result<Writable, Error>
  toString(): string
}