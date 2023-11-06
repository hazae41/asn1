import { Base16 } from "@hazae41/base16";
import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class OctetString {

  static readonly type = Type.from(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OCTET_STRING)

  constructor(
    readonly type: Type,
    readonly bytes: Bytes
  ) { }

  static create(bytes: Bytes) {
    return new OctetString(this.type, bytes)
  }

  toDER() {
    return OctetString.DER.from(this)
  }

  toString() {
    return `OCTET STRING ${Base16.get().tryEncode(this.bytes).unwrap()}`
  }

}

export namespace OctetString {

  export class DER extends OctetString {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly bytes: Bytes
    ) {
      super(type, bytes)
    }

    static from(asn1: OctetString) {
      const length = new Length(asn1.bytes.length).toDER()
      return new DER(asn1.type.toDER(), length, asn1.bytes)
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

      return new DER(type, length, bytes)
    }

  }

}