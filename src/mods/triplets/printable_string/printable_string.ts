import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { InvalidValueError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { DERTriplet } from "mods/resolvers/der/triplet.js";
import { Type } from "mods/type/type.js";

export class PrintableString {

  static readonly type = Type.create(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.PRINTABLE_STRING)

  constructor(
    readonly type: Type,
    readonly value: string,
  ) { }

  static is(value: string) {
    /**
     * a-z, A-Z, ' () +,-.?:/= and SPACE
     */
    return /^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value)
  }

  static createOrThrow(type = this.type, value: string) {
    if (!PrintableString.is(value))
      throw new InvalidValueError(`PrintableString`, value)
    return new PrintableString(type, value)
  }

  static tryCreate(type = this.type, value: string): Result<PrintableString, Error> {
    return Result.runAndDoubleWrapSync(() => this.createOrThrow(type, value))
  }

  toDER() {
    return PrintableString.DER.from(this)
  }

  toString() {
    return `PrintableString ${this.value}`
  }

}

export namespace PrintableString {

  export class DER extends PrintableString {

    static readonly type = PrintableString.type.toDER()

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: string,
      readonly bytes: Uint8Array
    ) {
      super(type.toDER(), value)
    }

    static from(asn1: PrintableString) {
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

      if (!PrintableString.is(value))
        throw new InvalidValueError(`PrintableString`, value)

      return new DER(type, length, value, bytes)
    }
  }
}