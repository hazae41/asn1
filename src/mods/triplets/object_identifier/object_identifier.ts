import { Binary } from "libs/binary/binary.js";
import { Bitset } from "libs/bitset/bitset.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export namespace VLQ {

  export function read(binary: Binary) {
    const values = new Array<number>()

    while (true) {
      const current = binary.readUint8()

      if (current <= 127) {
        values.push(current)
        break
      }

      const bitset = new Bitset(current, 8)
      values.push(bitset.disable(7).value)
    }

    let value = 0

    for (let i = 0; i < values.length; i++)
      value += values[i] * (128 ** (values.length - i - 1))
    return value
  }

}

export class ObjectIdentifier {
  readonly class = ObjectIdentifier

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OBJECT_IDENTIFIER)

  constructor(
    readonly value: string
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

    const head = binary.readUint8()
    const first = Math.floor(head / 40)
    const second = head % 40

    const values = [first, second]

    while (binary.offset - content < length.value)
      values.push(VLQ.read(binary))

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(values.join("."))
  }

  toString() {
    return `OBJECT IDENTIFIER ${this.value}`
  }
}