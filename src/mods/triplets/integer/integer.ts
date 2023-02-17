import { Cursor } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const bn256 = BigInt(256)

function sign(value: number, negative: boolean) {
  const bitset = new Bitset(value, 8)

  if (negative)
    return bitset.not()
  else
    return bitset
}

export class Integer {
  readonly #class = Integer

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.INTEGER)

  constructor(
    readonly type: Type,
    readonly value: bigint
  ) { }

  #data?: {
    length: Length
    values: Array<number>
  }

  #prepare() {
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

    values.reverse()

    const length = new Length(values.length)

    return this.#data = { length, values }
  }

  size() {
    const { length } = this.#prepare()

    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)

    const { length, values } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    const negative = this.value < 0

    const first = sign(values[0], negative)
      .setBE(0, negative)
      .value
    cursor.writeUint8(first)

    for (let i = 1; i < values.length; i++) {
      cursor.writeUint8(sign(values[i], negative).value)
    }
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)
    const length = Length.read(cursor)

    let value = BigInt(0)

    const negative = cursor.getUint8() > 127

    for (let i = 0; i < length.value; i++) {
      value = (value * bn256) + BigInt(sign(cursor.readUint8(), negative).value)
    }

    if (negative)
      value = ~value

    return new this(type, value)
  }

  toString() {
    return `INTEGER ${this.value}`
  }
}