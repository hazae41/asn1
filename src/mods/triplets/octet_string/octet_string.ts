import { Binary } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplet.js";
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

  #length?: Length

  get length() {
    this.prepare()

    const length = this.#length

    if (!length)
      throw new Error(`Unprepared length`)

    return length
  }

  prepare() {
    this.#length = new Length(this.bytes.length)
  }

  size() {
    return Triplets.size(this.length)
  }

  write(binary: Binary) {
    this.type.write(binary)

    const length = this.#length

    if (!length)
      throw new Error(`Unprepared length`)

    length.write(binary)

    const content = binary.offset

    binary.write(this.bytes)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(binary: Binary) {
    const type = Type.read(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(binary)

    return this.read2(binary, length.value)
  }

  static read2(binary: Binary, length: number) {
    const start = binary.offset

    const buffer = binary.read(length)

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(buffer)
  }

  toString() {
    return `OCTET STRING ${Bytes.toHex(this.bytes)}`
  }
}