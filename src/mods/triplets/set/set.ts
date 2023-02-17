import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const stringify = (set: Set) => `SET {
  ${set.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Set<T extends Triplet = Triplet> {
  readonly #class = Set

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SET)

  constructor(
    readonly type: Type,
    readonly triplets: T[]
  ) { }

  #data?: {
    length: Length
  }

  #prepare() {
    const length = new Length(this.triplets.reduce((p, c) => p + c.size(), 0))

    return this.#data = { length }
  }

  size() {
    const { length } = this.#prepare()

    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)

    const { length } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    for (const triplet of this.triplets)
      triplet.write(cursor)
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)
    const length = Length.read(cursor)

    const subcursor = new Cursor(cursor.read(length.value))

    const triplets = new Array<Opaque>()

    while (subcursor.remaining) {
      triplets.push(Opaque.read(subcursor))
    }

    return new this<Opaque>(type, triplets)
  }

  toString(): string {
    return stringify(this)
  }
}