import { Binary } from "@hazae41/binary";
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

  write(binary: Binary) {
    if (!this.#data)
      throw new Error(`Unprepared`)
    const { length } = this.#data

    this.type.write(binary)
    length.write(binary)

    const content = binary.offset

    binary.write(this.bytes)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(binary: Binary) {
    const type = Type.read(binary)

    const length = Length.read(binary)

    const start = binary.offset

    const buffer = binary.read(length.value)

    if (binary.offset - start !== length.value)
      throw new Error(`Invalid length`)

    return new this(type, buffer)
  }

  toString() {
    return `UNKNOWN`
  }
}