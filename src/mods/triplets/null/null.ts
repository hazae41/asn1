import { Binary } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Null {
  readonly #class = Null

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.NULL)

  constructor() { }

  get type() {
    return this.#class.type
  }

  #data?: {
    length: Length
  }

  prepare() {
    const length = new Length(0)
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

    return
  }

  static read(binary: Binary) {
    const type = Type.read(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(binary)

    return this.readl(binary, length.value)
  }

  static readl(binary: Binary, length: number) {
    const start = binary.offset

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this()
  }

  toString() {
    return `NULL`
  }
}