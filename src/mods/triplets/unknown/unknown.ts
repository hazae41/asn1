import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Unknown {

  constructor(
    readonly type: Type,
    readonly bytes: Uint8Array,
  ) { }

  #data?: {
    length: Length
  }

  prepare() {
    const length = new Length(this.bytes.length)
    return this.#data = { length }
  }

  size() {
    const { length } = this.prepare()
    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared`)
    const { length } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    const content = cursor.offset

    cursor.write(this.bytes)

    if (cursor.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)
    const length = Length.read(cursor)

    return this.readl(type, cursor, length.value)
  }

  static readl(type: Type, cursor: Cursor, length: number) {
    const start = cursor.offset

    const buffer = cursor.read(length)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(type, buffer)
  }

  toString() {
    return `UNKNOWN`
  }
}