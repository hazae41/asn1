import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { InvalidValueError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { DERTriplet } from "mods/resolvers/der/triplet.js";
import { Type } from "mods/type/type.js";

export class IA5String {

  static readonly type = Type.create(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.IA5_STRING)

  constructor(
    readonly type: Type,
    readonly value: string
  ) { }

  static is(value: string) {
    /**
     * ASCII
     */
    return /^[\x00-\x7F]*$/.test(value)
  }

  static createOrThrow(type = this.type, value: string) {
    if (!IA5String.is(value))
      throw new InvalidValueError(`IA5String`, value)

    return new IA5String(type, value)
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
      readonly bytes: Uint8Array
    ) {
      super(type, value)
    }

    static from(asn1: IA5String) {
      const bytes = Bytes.fromAscii(asn1.value)
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
      const value = Bytes.toAscii(bytes)

      if (!IA5String.is(value))
        throw new InvalidValueError(`IA5String`, value)

      return new DER(type, length, value, bytes)
    }

  }

}