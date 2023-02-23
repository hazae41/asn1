import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Null {
  readonly #class = Null

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.NULL)

  constructor(
    readonly type: Type
  ) { }

  static new() {
    return new this(this.type)
  }

  #data?: {
    length: Length
  }

  prepare() {
    const length = new Length(0).DER.prepare().parent

    this.#data = { length }
    return this
  }

  size() {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)
    const { length } = this.#data

    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)
    const { length } = this.#data

    this.type.DER.write(cursor)
    length.DER.write(cursor)
  }

  static read(cursor: Cursor) {
    const type = Type.DER.read(cursor)
    const length = Length.DER.read(cursor)

    if (length.value !== 0)
      throw new Error(`Invalid ${this.name} length`)

    return new this(type)
  }

  toString() {
    return `NULL`
  }
}