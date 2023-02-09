import { Binary } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const stringify = (set: Set) => `SET {
  ${set.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Set {
  readonly #class = Set

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SET)

  constructor(
    readonly triplets: Triplet[]
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

  #data?: {
    length: Length
  }

  prepare() {
    const length = new Length(this.triplets.reduce((p, c) => p + c.size(), 0))
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

    for (const triplet of this.triplets)
      triplet.write(binary)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(binary: Binary, read: (binary: Binary) => Triplet) {
    const type = Type.read(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(binary)

    return this.read2(binary, length.value, read)
  }

  static read2(binary: Binary, length: number, read: (binary: Binary) => Triplet) {
    const start = binary.offset

    const inner = new Array<Triplet>()

    while (binary.offset - start < length)
      inner.push(read(binary))

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(inner)
  }

  toString() {
    return stringify(this)
  }
}