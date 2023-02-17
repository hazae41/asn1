import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Constructed) => `[${parent.type.tag}] {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Constructed {

  constructor(
    readonly type: Type,
    readonly triplets: Triplet[]
  ) { }

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

  write(cursor: Cursor) {
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

  static read(cursor: Cursor, read: (cursor: Cursor) => Triplet) {
    const type = Type.read(cursor)

    if (type.wrap !== Type.wraps.CONSTRUCTED)
      throw new Error(`Invalid type`)

    const length = Length.read(cursor)

    return this.readl(type, cursor, length.value, read)
  }

  static readl(type: Type, cursor: Cursor, length: number, read: (cursor: Cursor) => Triplet) {
    const start = cursor.offset

    const triplets = new Array<Triplet>()

    while (cursor.offset - start < length)
      triplets.push(read(cursor))

    if (cursor.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(type, triplets)
  }

  toString() {
    return stringify(this)
  }
}