import { Binary } from "@hazae41/binary";
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
    readonly bytes: Uint8Array
  ) { }

  get type() {
    return this.#class.type
  }

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

  write(cursor: Binary) {
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

  static read(cursor: Binary) {
    const type = Type.read(cursor)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(cursor)

    return this.readl(cursor, length.value)
  }

  static readl(cursor: Binary, length: number) {
    const start = cursor.offset

    const buffer = cursor.read(length)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(buffer)
  }

  toString() {
    return `OCTET STRING ${Bytes.toHex(this.bytes)}`
  }
}