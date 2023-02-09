import { Binary } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Boolean {
  readonly #class = Boolean

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BOOLEAN)

  constructor(
    readonly value: number
  ) { }

  get type() {
    return this.#class.type
  }

  #data?: {
    length: Length
  }

  prepare() {
    const length = new Length(1)
    return this.#data = { length }
  }

  size() {
    const { length } = this.prepare()
    return Triplets.size(length)
  }

  write(binary: Binary) {
    if (!this.#data)
      throw new Error(`Unprepared`)
    const { length } = this.#data

    this.type.write(binary)
    length.write(binary)

    const content = binary.offset

    binary.writeUint8(this.value)

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

    const value = binary.readUint8()

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(value)
  }

  toString() {
    return `BOOLEAN ${this.value !== 0}`
  }
}