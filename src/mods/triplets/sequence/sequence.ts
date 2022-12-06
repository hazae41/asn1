import { Binary } from "libs/binary/binary.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Sequence) => `SEQUENCE {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Sequence {
  readonly class = Sequence

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SEQUENCE)

  constructor(
    readonly triplets: Triplet[]
  ) { }

  get type() {
    return this.class.type
  }

  get length() {
    return new Length(this.triplets.reduce((p, c) => p + c.size(), 0))
  }

  size() {
    return Triplet.size(this.length)
  }

  write(binary: Binary) {
    this.type.write(binary)

    const { length } = this

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

    const content = binary.offset

    const triplets = new Array<Triplet>()

    while (binary.offset - content < length.value)
      triplets.push(read(binary))

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(triplets)
  }

  toString() {
    return stringify(this)
  }
}