import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
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

  static new(value: string) {
    return new this(this.type, value)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<PrintableString.DER, Error> {
    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(this.value))
      return Err.error(`Invalid value for PrintableString`)

    const bytes = Bytes.fromUtf8(this.value)

    const type = this.type.tryToDER().inner
    const length = new Length(bytes.length).tryToDER().inner

    return new Ok(new PrintableString.DER(type, length, bytes))
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

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        this.type.tryWrite(cursor).throw()
        this.length.tryWrite(cursor).throw()

        cursor.tryWrite(this.bytes).throw()

        return Ok.void()
      }, Error)
    }

    static tryRead(cursor: Cursor): Result<PrintableString, Error> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        const value = cursor.tryReadString(length.value).throw()

        if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
          return Err.error(`Invalid value for PrintableString`)

        return new Ok(new PrintableString(type, value))
      }, Error)
    }
  }
}