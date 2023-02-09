import { Binary } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class BitString {
  readonly #class = BitString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BIT_STRING)

  constructor(
    readonly padding: number,
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
    this.#length = new Length(1 + this.bytes.length)
  }

  size() {
    return Triplet.size(this.length)
  }

  write(binary: Binary) {
    this.type.write(binary)

    const length = this.#length

    if (!length)
      throw new Error(`Unprepared length`)

    length.write(binary)

    const content = binary.offset

    binary.writeUint8(this.padding)
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

    const padding = binary.readUint8()
    const buffer = binary.read(length - 1)

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(padding, buffer)
  }

  toString() {
    const bignum = BigInt("0x" + Bytes.toHex(this.bytes))
    const binary = bignum.toString(2).padStart(this.bytes.length * 8, "0")

    return `BITSTRING ${binary.slice(0, binary.length - this.padding)}`
  }
}