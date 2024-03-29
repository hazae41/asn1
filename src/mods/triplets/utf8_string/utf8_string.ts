import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Length } from "mods/length/length.js";
import { DERTriplet } from "mods/resolvers/der/triplet.js";
import { Type } from "mods/type/type.js";

export class UTF8String {

  static readonly type = Type.create(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.UTF8_STRING)

  constructor(
    readonly type: Type,
    readonly value: string
  ) { }

  static create(type = this.type, value: string) {
    return new UTF8String(type, value)
  }

  toDER() {
    return UTF8String.DER.from(this)
  }

  toString() {
    return `UTF8String ${this.value}`
  }
}

export namespace UTF8String {

  export class DER extends UTF8String {

    static readonly type = UTF8String.type.toDER()

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: string,
      readonly bytes: Uint8Array
    ) {
      super(type, value)
    }

    static from(asn1: UTF8String) {
      const bytes = Bytes.fromUtf8(asn1.value)
      const length = new Length(bytes.length).toDER()

      return new DER(asn1.type.toDER(), length, asn1.value, bytes)
    }

    sizeOrThrow() {
      return DERTriplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      cursor.writeOrThrow(this.bytes)
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      const bytes = cursor.readAndCopyOrThrow(length.value)
      const value = Bytes.toUtf8(bytes)

      return new DER(type, length, value, bytes)
    }
  }
}