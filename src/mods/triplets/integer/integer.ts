import { Binary } from "libs/binary/binary.js";
import { Bitset } from "libs/bitset/bitset.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

function sign(value: number, negative: boolean) {
  if (negative)
    return new Bitset(value, 8).not().value
  return value
}

export class Integer {
  readonly class = Integer

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.INTEGER)

  constructor(
    readonly value: bigint
  ) { }

  get type() {
    return this.class.type
  }

  get length() {
    return new Length(0) // TODO
  }

  size() {
    return Triplet.size(this.length)
  }

  write(binary: Binary) {
    this.type.write(binary)

    const { length } = this

    length.write(binary)

    const content = binary.offset

    // TODO

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(binary: Binary) {
    const type = Type.read(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(binary)

    const content = binary.offset

    let value = BigInt(0)

    const negative = binary.readUint8(true) > 127

    for (let i = 0; i < length.value; i++)
      value += BigInt(sign(binary.readUint8(), negative)) * (BigInt(256) ** BigInt(length.value - i - 1))

    if (negative)
      value = ~value

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(value)
  }

  toString() {
    return `INTEGER ${this.value}`
  }
}