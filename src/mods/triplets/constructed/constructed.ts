import { Binary } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplet, Triplets } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Constructed) => `[${parent.type.tag}] {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Constructed {

  constructor(
    readonly type: Type,
    readonly triplets: Triplet[]
  ) { }

  #length?: Length

  get length() {
    this.prepare()

    const length = this.#length

    if (!length)
      throw new Error(`Unprepared length`)

    return length
  }

  prepare() {
    this.#length = new Length(this.triplets.reduce((p, c) => p + c.size(), 0))
  }

  size() {
    return Triplets.size(this.length)
  }

  write(binary: Binary) {
    this.type.write(binary)

    const length = this.#length

    if (!length)
      throw new Error(`Unprepared length`)

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