import { Cursor, Writable } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Constructed) => `[${parent.type.tag}] {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Constructed<T extends Triplet = Triplet> {
  readonly #class = Constructed

  constructor(
    readonly type: Type,
    readonly triplets: T[]
  ) { }

  get class() {
    return this.#class
  }

  toDER() {
    return new Constructed.DER<T>(this)
  }

  toString(): string {
    return stringify(this)
  }

}

export namespace Constructed {

  export class DER<T extends Triplet = Triplet> {
    static inner = Constructed

    constructor(
      readonly inner: Constructed<T>
    ) { }

    #data?: {
      length: Length.DER,
      triplets: Writable[]
    }

    prepare() {
      const triplets = this.inner.triplets.map(it => it.toDER().prepare())
      const length = new Length(triplets.reduce((p, c) => p + c.size(), 0)).toDER().prepare()

      this.#data = { length, triplets }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { length } = this.#data

      return Triplets.size(length)
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { length, triplets } = this.#data

      this.inner.type.toDER().write(cursor)
      length.write(cursor)

      for (const triplet of triplets)
        triplet.write(cursor)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)

      if (type.wrap !== Type.wraps.CONSTRUCTED)
        throw new Error(`Invalid type`)

      const length = Length.DER.read(cursor)

      const content = cursor.read(length.value)
      const subcursor = new Cursor(content)

      const triplets = new Array<Opaque>()

      while (subcursor.remaining)
        triplets.push(Opaque.DER.read(subcursor))

      return new this.inner<Opaque>(type, triplets)
    }
  }

}