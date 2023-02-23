import { Cursor, Writable } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { OpaqueTriplet } from "mods/triplets/opaque/opaque.js";
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

  static new<T extends Triplet = Triplet>(triplets: T[]) {
    return new this<T>(this.type, triplets)
  }

  #data?: {
    length: Length,
    triplets: Writable[]
  }

  prepare() {
    const triplets = this.triplets.map(it => it.prepare())
    const length = new Length(triplets.reduce((p, c) => p + c.size(), 0)).DER.prepare().parent

    this.#data = { length, triplets }
    return this
  }

  size() {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)
    const { length } = this.#data

    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)
    const { length, triplets } = this.#data

    this.type.DER.write(cursor)
    length.DER.write(cursor)

    for (const triplet of triplets)
      triplet.write(cursor)
  }

  static read(cursor: Cursor) {
    const type = Type.DER.read(cursor)
    const length = Length.DER.read(cursor)

    const subcursor = new Cursor(cursor.read(length.value))

    const triplets = new Array<OpaqueTriplet>()

    while (subcursor.remaining)
      triplets.push(OpaqueTriplet.read(subcursor))

    return new this<OpaqueTriplet>(type, triplets)
  }

  toString(): string {
    return stringify(this)
  }
}