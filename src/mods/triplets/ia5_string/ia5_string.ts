import { Cursor } from "@hazae41/binary";
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
    readonly type: Type,
    readonly value: string
  ) { }

  #data?: {
    length: Length,
    bytes: Uint8Array
  }

  #prepare() {
    const bytes = Bytes.fromAscii(this.value)
    const length = new Length(bytes.length)

    return this.#data = { length, bytes }
  }

  size() {
    const { length } = this.#prepare()

    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)

    const { length, bytes } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    cursor.write(bytes)
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)
    const length = Length.read(cursor)

    const bytes = cursor.read(length.value)
    const value = Bytes.toAscii(bytes)

    return new this(type, value)
  }

  toString() {
    return `IA5String ${this.value}`
  }
}