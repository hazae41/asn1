import { Binary } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

const bn256 = BigInt(256)

function sign(value: number, negative: boolean) {
  if (negative)
    return new Bitset(value, 8).not().value
  return value
}

export class Integer {
  readonly #class = Integer

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.INTEGER)

  constructor(
    readonly value: bigint
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

  private _values?: Array<number>

  prepare() {
    let value = this.value < 0
      ? ~this.value
      : this.value

    const values = new Array<number>()

    do {
      values.push(Number(value % bn256))
      value = value / bn256
    } while (value)

    if (values[values.length - 1] > 127)
      values.push(0)

    this._values = values.reverse()
    this._length = new Length(values.length)
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

    const values = this._values

    if (!values)
      throw new Error(`Unprepared values`)

    const negative = this.value < 0

    const first = new Bitset(sign(values[0], negative), 8)
      .setBE(0, negative)
      .value
    binary.writeUint8(first)

    for (let i = 1; i < values.length; i++)
      binary.writeUint8(sign(values[i], negative))

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(binary: Binary) {
    const type = Type.read(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(binary)

    return this.read2(binary, length.value)
  }

  static read2(binary: Binary, length: number) {
    const start = binary.offset

    let value = BigInt(0)

    const negative = binary.getUint8() > 127

    for (let i = 0; i < length; i++)
      value = (value * bn256) + BigInt(sign(binary.readUint8(), negative))

    value = negative
      ? ~value
      : value

    if (binary.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(value)
  }

  toString() {
    return `INTEGER ${this.value}`
  }
}