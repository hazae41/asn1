import { Bytes } from "@hazae41/bytes";
import { Cursor, CursorReadUnknownError, CursorWriteLengthOverflowError, CursorWriteUnknownError } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Unimplemented } from "index.js";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class UTF8String {
  readonly #class = UTF8String

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.UTF8_STRING)

  constructor(
    readonly type: Type,
    readonly value: string
  ) { }

  static create(value: string) {
    return new UTF8String(this.type, value)
  }

  get class() {
    return this.#class
  }

  toDER() {
    const bytes = Bytes.fromUtf8(this.value)

    const type = this.type.toDER()
    const length = new Length(bytes.length).toDER()

    return new UTF8String.DER(type, length, bytes)
  }

  toString() {
    return `UTF8String ${this.value}`
  }
}

export namespace UTF8String {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly bytes: Bytes
    ) { }

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError | CursorWriteLengthOverflowError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        cursor.tryWrite(this.bytes).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<UTF8String, CursorReadUnknownError | Unimplemented> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const value = cursor.tryReadString(length.value).throw(t)

        return new Ok(new UTF8String(type, value))
      })
    }
  }
}