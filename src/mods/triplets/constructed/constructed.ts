import { Binary } from "@hazae41/binary";
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

    if (type.wrap !== Type.wraps.CONSTRUCTED)
      throw new Error(`Invalid type`)

    const length = Length.read(binary)

    const start = binary.offset

    const triplets = new Array<Triplet>()

    while (binary.offset - start < length.value)
      triplets.push(read(binary))

    if (binary.offset - start !== length.value)
      throw new Error(`Invalid length`)

    return new this(type, triplets)
  }

  toString() {
    return stringify(this)
  }
}