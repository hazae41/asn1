import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
import { InvalidValueError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class PrintableString {

  static readonly type = Type.from(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.PRINTABLE_STRING)

  constructor(
    readonly type: Type,
    readonly value: string,
    readonly bytes: Uint8Array
  ) { }

  static newOrThrow(type: Type, value: string) {
    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
      throw new InvalidValueError(`PrintableString`, value)

    return new Ok(new PrintableString(type, value, Bytes.fromUtf8(value)))
  }

  static tryNew(type: Type, value: string): Result<PrintableString, InvalidValueError> {
    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
      return new Err(new InvalidValueError(`PrintableString`, value))

    return new Ok(new PrintableString(type, value, Bytes.fromUtf8(value)))
  }

  static createOrThrow(value: string) {
    return this.newOrThrow(this.type, value)
  }

  static tryCreate(value: string): Result<PrintableString, InvalidValueError> {
    return this.tryNew(this.type, value)
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
      super(type.toDER(), value, bytes)
    }

    static from(asn1: PrintableString) {
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
      const value = Bytes.toUtf8(bytes)

      if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
        throw new InvalidValueError(`PrintableString`, value)

      return new DER(type, length, value, bytes)
    }
  }
}