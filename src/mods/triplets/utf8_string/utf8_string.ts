import { Binary } from "@hazae41/binary";
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
    readonly value: string
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

  #bytes?: Uint8Array

  prepare() {
    const bytes = Bytes.fromUtf8(this.value)

    this.#bytes = bytes
    this.#length = new Length(bytes.length)
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

    const buffer = this.#bytes

    if (!buffer)
      throw new Error(`Unprepared buffer`)

    binary.write(buffer)

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

    const value = binary.readString(length)

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(value)
  }

  toString() {
    return `UTF8String ${this.value}`
  }
}