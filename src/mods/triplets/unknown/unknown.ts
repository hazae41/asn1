import { Binary } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Unknown {

  constructor(
    readonly type: Type,
    readonly bytes: Uint8Array,
  ) { }

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