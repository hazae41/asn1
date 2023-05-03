import { Arrays } from "@hazae41/arrays";
import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
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

  static new(value: bigint) {
    return new this(this.type, value)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<Integer.DER, never> {
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

    const type = this.type.tryToDER().inner
    const length = new Length(values.length).tryToDER().inner

    return new Ok(new Integer.DER(type, length, this.value, values))
  }

  toString() {
    return `INTEGER ${this.value}`
  }
}

export namespace Integer {

  export class DER {
    static inner = Integer

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: bigint,
      readonly values: Array<number>
    ) { }

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor) {
      return Result.unthrowSync(() => {
        this.type.tryWrite(cursor).throw()
        this.length.tryWrite(cursor).throw()

        const negative = this.value < 0

        const first = sign(this.values[0], negative)
          .setBE(0, negative)
          .value
        cursor.tryWriteUint8(first).throw()

        for (let i = 1; i < this.values.length; i++)
          cursor.tryWriteUint8(sign(this.values[i], negative).value).throw()

        return Ok.void()
      }, Error)
    }

    static read(cursor: Cursor) {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        let value = BigInt(0)

        const negative = cursor.tryGetUint8().throw() > 127

        for (let i = 0; i < length.value; i++)
          value = (value * bn256) + BigInt(sign(cursor.tryReadUint8().throw(), negative).value)

        if (negative)
          value = ~value

        return new Ok(new Integer(type, value))
      }, Error)
    }

  }
}