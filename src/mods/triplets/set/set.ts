import { Binary } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
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

  private _length?: Length

  get length() {
    this.prepare()

    const length = this._length

    if (!length)
      throw new Error(`Unprepared length`)

    return length
  }

  prepare() {
    this._length = new Length(this.triplets.reduce((p, c) => p + c.size(), 0))
  }

  size() {
    return Triplet.size(this.length)
  }
  write(binary: Binary) {
    this.type.write(binary)

    const length = this._length

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