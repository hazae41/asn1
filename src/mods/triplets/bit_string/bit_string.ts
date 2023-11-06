import { Base16 } from "@hazae41/base16";
import { Cursor } from "@hazae41/cursor";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class BitString {

  static type = Type.from(
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

  toDER() {
    const type = this.type.toDER()
    const length = new Length(1 + this.bytes.length).toDER()

    return new BitString.DER(type, length, this.padding, this.bytes)
  }

  toString() {
    const bignum = BigInt("0x" + Base16.get().encodeOrThrow(this.bytes))
    const cursor = bignum.toString(2).padStart(this.bytes.length * 8, "0")

    return `BITSTRING ${cursor.slice(0, cursor.length - this.padding)}`
  }

}

export namespace BitString {

  export class DER extends BitString {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly padding: number,
      readonly bytes: Uint8Array,
    ) {
      super(type, padding, bytes)
    }

    toASN1() {
      return new BitString(this.type.toASN1(), this.padding, this.bytes)
    }

    sizeOrThrow() {
      return Triplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      cursor.writeUint8OrThrow(this.padding)
      cursor.writeOrThrow(this.bytes)
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      const content = cursor.readOrThrow(length.value)
      const subcursor = new Cursor(content)

      const padding = subcursor.readUint8OrThrow()
      const bytes = subcursor.readOrThrow(subcursor.remaining)

      return new DER(type, length, padding, bytes)
    }

  }
}