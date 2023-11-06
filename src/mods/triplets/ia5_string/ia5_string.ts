import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class IA5String {

  static readonly type = Type.from(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.IA5_STRING)

  constructor(
    readonly type: Type,
    readonly value: string,
    readonly bytes: Bytes
  ) { }

  static create(value: string) {
    return new IA5String(this.type, value, Bytes.fromAscii(value))
  }

  toDER() {
    return IA5String.DER.from(this)
  }

  toString() {
    return `IA5String ${this.value}`
  }

}

export namespace IA5String {

  export class DER extends IA5String {

    static readonly type = IA5String.type.toDER()

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: string,
      readonly bytes: Bytes
    ) {
      super(type, value, bytes)
    }

    static from(asn1: IA5String) {
      const length = new Length(asn1.bytes.length).toDER()
      return new DER(asn1.type.toDER(), length, asn1.value, asn1.bytes)
    }

    sizeOrThrow() {
      return Triplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      cursor.writeOrThrow(this.bytes)
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      const content = cursor.readOrThrow(length.value)

      const bytes = new Uint8Array(content)
      const value = Bytes.toAscii(bytes)

      return new DER(type, length, value, bytes)
    }

  }

}