import { Binary } from "@hazae41/binary";
import { Bytes } from "libs/bytes/bytes.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
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

  private _length?: Length

  get length() {
    this.prepare()

    const length = this._length

    if (!length)
      throw new Error(`Unprepared length`)

    return length
  }

  private _bytes?: Uint8Array

  prepare() {
    const bytes = Bytes.fromAscii(this.value)

    this._bytes = bytes
    this._length = new Length(bytes.length)
  }

  size() {
    return Triplet.size(this.length)
  }

  write(binary: Binary) {
    this.type.write(binary)

    const length = this._length

    if (!length)
      throw new Error(`Unprepared length`)

    length.write(binary)

    const content = binary.offset

    const buffer = this._bytes

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

    const bytes = binary.read(length)
    const value = Bytes.toAscii(bytes)

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(value)
  }

  toString() {
    return `IA5String ${this.value}`
  }
}