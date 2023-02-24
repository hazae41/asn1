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

  readonly DER = new Integer.DER(this)

  constructor(
    readonly type: Type.DER,
    readonly value: bigint
  ) { }

  static new(value: bigint) {
    return new this(this.type.toDER(), value)
  }

  get class() {
    return this.#class
  }

  toString() {
    return `INTEGER ${this.value}`
  }
}

export namespace Integer {

  export class DER {
    static parent = Integer

    constructor(
      readonly parent: Integer
    ) { }

    #data?: {
      length: Length.DER
      values: Array<number>
    }

    prepare() {
      let value = this.parent.value < 0
        ? ~this.parent.value
        : this.parent.value

      const values = new Array<number>()

      do {
        values.push(Number(value % bn256))
        value = value / bn256
      } while (value)

      if (values[values.length - 1] > 127)
        values.push(0)

      values.reverse()

      const length = Length.DER.new(values.length).prepare()

      this.#data = { length, values }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { length } = this.#data

      return Triplets.size(length)
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { length, values } = this.#data

      this.parent.type.write(cursor)
      length.write(cursor)

      const negative = this.parent.value < 0

      const first = sign(values[0], negative)
        .setBE(0, negative)
        .value
      cursor.writeUint8(first)

      for (let i = 1; i < values.length; i++) {
        cursor.writeUint8(sign(values[i], negative).value)
      }
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      let value = BigInt(0)

      const negative = cursor.getUint8() > 127

      for (let i = 0; i < length.inner.value; i++) {
        value = (value * bn256) + BigInt(sign(cursor.readUint8(), negative).value)
      }

      if (negative)
        value = ~value

      return new this.parent(type, value)
    }

  }
}