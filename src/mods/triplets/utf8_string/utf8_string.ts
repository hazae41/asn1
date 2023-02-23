import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class UTF8String {
  readonly #class = UTF8String

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.UTF8_STRING)

  constructor(
    readonly type: Type,
    readonly value: string
  ) { }

  static new(value: string) {
    return new this(this.type, value)
  }

  #data?: {
    length: Length
    bytes: Uint8Array
  }

  prepare() {
    const bytes = Bytes.fromUtf8(this.value)
    const length = new Length(bytes.length).prepare()

    this.#data = { length, bytes }
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
    const { length, bytes } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    cursor.write(bytes)
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)
    const length = Length.read(cursor)

    const value = cursor.readString(length.value)

    return new this(type, value)
  }

  toString() {
    return `UTF8String ${this.value}`
  }
}