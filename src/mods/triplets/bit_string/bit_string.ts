import { Base16 } from "@hazae41/base16";
import { Cursor } from "@hazae41/cursor";
import { Length } from "mods/length/length.js";
import { DERTriplet } from "mods/resolvers/der/triplet.js";
import { Type } from "mods/type/type.js";

export class BitString {

  static readonly type = Type.create(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BIT_STRING)

  constructor(
    readonly type: Type,
    readonly padding: number,
    readonly bytes: Uint8Array,
  ) { }

  static create(type = this.type, padding: number, bytes: Uint8Array) {
    return new BitString(type, padding, bytes)
  }

  toDER() {
    return BitString.DER.from(this)
  }

  toString() {
    const bignum = BigInt("0x" + Base16.get().encodeOrThrow(this.bytes))
    const cursor = bignum.toString(2).padStart(this.bytes.length * 8, "0")

    return `BITSTRING ${cursor.slice(0, cursor.length - this.padding)}`
  }

}

export namespace BitString {

  export class DER extends BitString {

    static readonly type = BitString.type.toDER()

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly padding: number,
      readonly bytes: Uint8Array,
    ) {
      super(type, padding, bytes)
    }

    static from(asn1: BitString) {
      const length = new Length(asn1.bytes.length + 1).toDER()

      return new DER(asn1.type.toDER(), length, asn1.padding, asn1.bytes)
    }

    sizeOrThrow() {
      return DERTriplet.sizeOrThrow(this.length)
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
      const string = subcursor.readOrThrow(subcursor.remaining)
      const bytes = new Uint8Array(string)

      return new DER(type, length, padding, bytes)
    }

  }
}