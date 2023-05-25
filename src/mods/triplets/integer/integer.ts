import { Arrays } from "@hazae41/arrays";
import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Unimplemented } from "index.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
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

  static create(value: bigint) {
    return new Integer(this.type, value)
  }

  get class() {
    return this.#class
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

    if (Arrays.last(values) > 127)
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

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: bigint,
      readonly values: Array<number>
    ) { }

    trySize(): Result<number, never> {
      return Triplet.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        const negative = this.value < 0

        const first = sign(this.values[0], negative)
          .setBE(0, negative)
          .value
        cursor.tryWriteUint8(first).throw(t)

        for (let i = 1; i < this.values.length; i++)
          cursor.tryWriteUint8(sign(this.values[i], negative).value).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<Integer, BinaryReadError | Unimplemented> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        let value = BigInt(0)

        const negative = cursor.tryGetUint8().throw(t) > 127

        for (let i = 0; i < length.value; i++)
          value = (value * bn256) + BigInt(sign(cursor.tryReadUint8().throw(t), negative).value)

        if (negative)
          value = ~value

        return new Ok(new Integer(type, value))
      })
    }

  }
}