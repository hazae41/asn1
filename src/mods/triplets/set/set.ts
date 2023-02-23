import { Cursor, Writable } from "@hazae41/binary";
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

  readonly DER = new Set.DER<T>(this)

  constructor(
    readonly type: Type,
    readonly triplets: T[]
  ) { }

  static new<T extends Triplet = Triplet>(triplets: T[]) {
    return new this<T>(this.type, triplets)
  }

  get class() {
    return this.#class
  }

  toString(): string {
    return stringify(this)
  }
}

export namespace Set {

  export class DER<T extends Triplet = Triplet> {
    static parent = Set

    constructor(
      readonly parent: Set<T>
    ) { }

    #data?: {
      length: Length,
      triplets: Writable[]
    }

    prepare() {
      const triplets = this.parent.triplets.map(it => it.DER.prepare())
      const length = new Length(triplets.reduce((p, c) => p + c.size(), 0)).DER.prepare().parent

      this.#data = { length, triplets }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { length } = this.#data

      return Triplets.size(length)
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { length, triplets } = this.#data

      this.parent.type.DER.write(cursor)
      length.DER.write(cursor)

      for (const triplet of triplets)
        triplet.write(cursor)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const subcursor = new Cursor(cursor.read(length.value))

      const triplets = new Array<Opaque>()

      while (subcursor.remaining)
        triplets.push(Opaque.DER.read(subcursor))

      return new this.parent<Opaque>(type, triplets)
    }
  }
}