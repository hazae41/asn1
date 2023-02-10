import { Binary } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class IA5String {
  readonly #class = IA5String

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.IA5_STRING)

  constructor(
    readonly value: string
  ) { }

  get type() {
    return this.#class.type
  }

  #data?: {
    length: Length,
    bytes: Uint8Array
  }

  prepare() {
    const bytes = Bytes.fromAscii(this.value)
    const length = new Length(bytes.length)
    return this.#data = { length, bytes }
  }

  size() {
    const { length } = this.prepare()
    return Triplets.size(length)
  }

  write(cursor: Binary) {
    if (!this.#data)
      throw new Error(`Unprepared`)
    const { length, bytes } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    const content = cursor.offset

    cursor.write(bytes)

    if (cursor.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(cursor: Binary) {
    const type = Type.read(cursor)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(cursor)

    return this.readl(cursor, length.value)
  }

  static readl(cursor: Binary, length: number) {
    const start = cursor.offset

    const bytes = cursor.read(length)
    const value = Bytes.toAscii(bytes)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(value)
  }

  toString() {
    return `IA5String ${this.value}`
  }
}