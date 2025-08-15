import { Base16 } from "@hazae41/base16";
import { Cursor } from "@hazae41/cursor";
import { Bytes, BytesLike } from "libs/bytes/index.js";
import { Length } from "mods/length/length.js";
import { DERTriplet } from "mods/resolvers/der/triplet.js";
import { Type } from "mods/type/type.js";

export class OctetString {

  static readonly type = Type.create(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OCTET_STRING)

  constructor(
    readonly type: Type,
    readonly bytes: Bytes
  ) { }

  static create(type = this.type, bytes: BytesLike) {
    return new OctetString(type, Bytes.from(bytes))
  }

  toDER() {
    return OctetString.DER.from(this)
  }

  toString() {
    return `OCTET STRING ${Base16.encodeOrThrow(this.bytes)}`
  }

}

export namespace OctetString {

  export class DER extends OctetString {

    static readonly type = OctetString.type.toDER()

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

      const bytes = Bytes.copy(cursor.readOrThrow(length.value))

      return new DER(type, length, bytes)
    }

  }

}