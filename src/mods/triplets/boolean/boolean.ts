import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Boolean {
  readonly #class = Boolean

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BOOLEAN)

  constructor(
    readonly type: Type,
    readonly value: number
  ) { }

  static new(value: number) {
    return new this(this.type, value)
  }

  #data?: {
    length: Length
  }

  prepare() {
    const length = new Length(1).prepare()

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

    this.type.write(cursor)
    length.write(cursor)

    cursor.writeUint8(this.value)
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)
    const length = Length.read(cursor)

    if (length.value !== 1)
      throw new Error(`Invalid ${this.name} length`)

    const value = cursor.readUint8()

    return new this(type, value)
  }

  toString() {
    return `BOOLEAN ${this.value !== 0}`
  }
}