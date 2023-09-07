import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result, Unimplemented } from "@hazae41/result";
import { InvalidValueError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class PrintableString {
  readonly #class = PrintableString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.PRINTABLE_STRING)

  constructor(
    readonly type: Type,
    readonly value: string
  ) { }

  static new(type: Type, value: string) {
    return new PrintableString(type, value)
  }

  static tryNew(type: Type, value: string): Result<PrintableString, InvalidValueError> {
    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
      return new Err(new InvalidValueError(`PrintableString`, value))

    return new Ok(new PrintableString(type, value))
  }

  static create(value: string) {
    return new PrintableString(this.type, value)
  }

  static tryCreate(value: string): Result<PrintableString, InvalidValueError> {
    return this.tryNew(this.type, value)
  }

  get class() {
    return this.#class
  }

  toDER() {
    const bytes = Bytes.fromUtf8(this.value)

    const type = this.type.toDER()
    const length = new Length(bytes.length).toDER()

    return new PrintableString.DER(type, length, bytes)
  }

  toString() {
    return `PrintableString ${this.value}`
  }
}

export namespace PrintableString {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly bytes: Bytes
    ) { }

    [Symbol.dispose]() { }

    trySize(): Result<number, never> {
      return Triplet.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        cursor.tryWrite(this.bytes).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<PrintableString, BinaryReadError | Unimplemented | InvalidValueError> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const value = cursor.tryReadUtf8(length.value).throw(t)

        return PrintableString.tryNew(type, value)
      })
    }
  }
}