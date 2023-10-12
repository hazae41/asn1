import { Base16 } from "@hazae41/base16";
import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result, Unimplemented } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class BitString {
  readonly #class = BitString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BIT_STRING)

  constructor(
    readonly type: Type,
    readonly padding: number,
    readonly bytes: Uint8Array
  ) { }

  static create(padding: number, bytes: Uint8Array) {
    return new BitString(this.type, padding, bytes)
  }

  get class() {
    return this.#class
  }

  toDER() {
    const type = this.type.toDER()
    const length = new Length(1 + this.bytes.length).toDER()

    return new BitString.DER(type, length, this.padding, this.bytes)
  }

  toString() {
    const bignum = BigInt("0x" + Base16.get().tryEncode(this.bytes).unwrap())
    const cursor = bignum.toString(2).padStart(this.bytes.length * 8, "0")

    return `BITSTRING ${cursor.slice(0, cursor.length - this.padding)}`
  }

}

export namespace BitString {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly padding: number,
      readonly bytes: Uint8Array,
    ) { }



    trySize(): Result<number, never> {
      return Triplet.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        cursor.tryWriteUint8(this.padding).throw(t)
        cursor.tryWrite(this.bytes).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<BitString, BinaryReadError | Unimplemented> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const content = cursor.tryRead(length.value).throw(t)
        const subcursor = new Cursor(content)

        const padding = subcursor.tryReadUint8().throw(t)
        const bytes = subcursor.tryRead(subcursor.remaining).throw(t)

        return new Ok(new BitString(type, padding, bytes))
      })
    }

  }
}