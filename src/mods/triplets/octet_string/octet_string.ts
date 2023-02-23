import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class OctetString {
  readonly #class = OctetString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OCTET_STRING)

  constructor(
    readonly type: Type,
    readonly bytes: Uint8Array
  ) { }

  static new(bytes: Uint8Array) {
    return new this(this.type, bytes)
  }

  #data?: {
    length: Length
  }

  prepare() {
    const length = new Length(this.bytes.length).DER.prepare().parent

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

    cursor.write(this.bytes)
  }

  static read(cursor: Cursor) {
    const type = Type.DER.read(cursor)
    const length = Length.DER.read(cursor)

    const buffer = cursor.read(length.value)

    return new this(type, buffer)
  }

  toString() {
    return `OCTET STRING ${Bytes.toHex(this.bytes)}`
  }
}