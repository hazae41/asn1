import { Cursor, Writable } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Sequence) => `SEQUENCE {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Sequence<T extends Triplet = Triplet> {
  readonly #class = Sequence

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SEQUENCE)

  readonly DER = new Sequence.DER<T>(this)

  constructor(
    readonly type: Type.DER,
    readonly triplets: T[]
  ) { }

  static new<T extends Triplet = Triplet>(triplets: T[]) {
    return new this<T>(this.type.toDER(), triplets)
  }

  get class() {
    return this.#class
  }

  toString(): string {
    return stringify(this)
  }

}

export namespace Sequence {

  export class DER<T extends Triplet = Triplet> {
    static parent = Sequence

    constructor(
      readonly parent: Sequence<T>
    ) { }

    #data?: {
      length: Length.DER,
      triplets: Writable[]
    }

    prepare() {
      const triplets = this.parent.triplets.map(it => it.DER.prepare())
      const length = Length.DER.new(triplets.reduce((p, c) => p + c.size(), 0)).prepare()

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

      this.parent.type.write(cursor)
      length.write(cursor)

      for (const triplet of triplets)
        triplet.write(cursor)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const content = cursor.read(length.inner.value)
      const subcursor = new Cursor(content)

      const triplets = new Array<Opaque>()

      while (subcursor.remaining)
        triplets.push(Opaque.DER.read(subcursor))

      return new this.parent<Opaque>(type, triplets)
    }

  }
}