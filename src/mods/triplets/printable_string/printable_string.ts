import { Binary } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class PrintableString {
  readonly #class = PrintableString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.PRINTABLE_STRING)

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
    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(this.value))
      throw new Error(`Invalid value`)

    const bytes = Bytes.fromUtf8(this.value)
    const length = new Length(bytes.length)
    return this.#data = { length, bytes }
  }

  size() {
    const { length } = this.prepare()
    return Triplets.size(length)
  }

  write(binary: Binary) {
    if (!this.#data)
      throw new Error(`Unprepared`)
    const { length, bytes } = this.#data

    this.type.write(binary)
    length.write(binary)

    const content = binary.offset

    binary.write(bytes)

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

    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
      throw new Error(`Invalid value`)

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(value)
  }

  toString() {
    return `PrintableString ${this.value}`
  }
}