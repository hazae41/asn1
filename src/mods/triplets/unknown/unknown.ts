import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Unknown {
  readonly #class = Unknown

  /**
   * An unknown triplet, not resolved
   * 
   * Like Opaque, but the bytes do not contain Type + Length
   * @param type 
   * @param bytes 
   */
  constructor(
    readonly type: Type,
    readonly bytes: Uint8Array,
  ) { }

  #data?: {
    length: Length
  }

  #prepare() {
    const length = new Length(this.bytes.length)

    return this.#data = { length }
  }

  size() {
    const { length } = this.#prepare()

    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)

    const { length } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    cursor.write(this.bytes)
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)
    const length = Length.read(cursor)

    const bytes = cursor.read(length.value)

    return new this(type, bytes)
  }

  toString() {
    return `UNKNOWN`
  }
}