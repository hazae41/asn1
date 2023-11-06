import { Arrays } from "@hazae41/arrays";
import { Cursor } from "@hazae41/cursor";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

const bn256 = BigInt(256)

export class Integer {

  static type = Type.from(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.INTEGER)

  constructor(
    readonly type: Type,
    readonly value: bigint
  ) { }

  static create(value: bigint) {
    return new Integer(this.type, value)
  }

  toDER() {
    let divided = this.value < 0
      ? ~this.value
      : this.value

    const values = new Array<number>()

    do {
      values.push(Number(divided % bn256))
      divided /= bn256
    } while (divided)

    if (Arrays.last(values)! > 127)
      values.push(0)

    values.reverse()

    const type = this.type.toDER()
    const length = new Length(values.length).toDER()

    return new Integer.DER(type, length, this.value, values)
  }

  toString() {
    return `INTEGER ${this.value}`
  }

}

export namespace Integer {

  export class DER extends Integer {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: bigint,
      readonly values: Array<number>
    ) {
      super(type, value)
    }

    sizeOrThrow(): number {
      return Triplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      const negative = this.value < 0

      let first = this.values[0]

      if (negative) {
        /**
         * Bitwise NOT
         */
        first = (1 << 8) - first - 1

        /**
         * Enable the first BE bit
         */
        first |= 1 << (8 - 0 - 1)
      }

      cursor.writeUint8OrThrow(first)

      for (let i = 1; i < this.values.length; i++) {
        let byte = this.values[i]

        if (negative)
          /**
           * Bitwise NOT
           */
          byte = (1 << 8) - byte - 1

        cursor.writeUint8OrThrow(byte)
      }

      return
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      let value = BigInt(0)

      const values = new Array<number>()

      const negative = cursor.getUint8OrThrow() & (1 << (8 - 0 - 1))

      for (let i = 0; i < length.value; i++) {
        let byte = cursor.readUint8OrThrow()

        if (negative)
          /**
           * Bitwise NOT
           */
          byte = (1 << 8) - byte - 1

        value = (value * bn256) + BigInt(byte)
        values.push(byte)
      }

      if (negative)
        value = ~value

      return new DER(type, length, value, values)
    }

  }
}