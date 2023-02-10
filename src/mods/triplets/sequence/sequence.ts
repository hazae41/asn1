import { Binary } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Sequence) => `SEQUENCE {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Sequence {
  readonly #class = Sequence

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SEQUENCE)

  constructor(
    readonly triplets: Triplet[]
  ) { }

  get type() {
    return this.#class.type
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

  write(cursor: Binary) {
    if (!this.#data)
      throw new Error(`Unprepared`)
    const { length } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    const content = cursor.offset

    for (const triplet of this.triplets)
      triplet.write(cursor)

    if (cursor.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(cursor: Binary, read: (cursor: Binary) => Triplet) {
    const type = Type.read(cursor)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(cursor)

    return this.readl(cursor, length.value, read)
  }

  static readl(cursor: Binary, length: number, read: (cursor: Binary) => Triplet) {
    const start = cursor.offset

    const triplets = new Array<Triplet>()

    while (cursor.offset - start < length)
      triplets.push(read(cursor))

    if (cursor.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(triplets)
  }

  toString() {
    return stringify(this)
  }
}