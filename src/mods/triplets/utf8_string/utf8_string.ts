import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
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

  tryToDER(): Result<UTF8String.DER, never> {
    const bytes = Bytes.fromUtf8(this.value)

    const type = this.type.tryToDER().inner
    const length = new Length(bytes.length).tryToDER().inner

    return new Ok(new UTF8String.DER(type, length, bytes))
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

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        this.type.tryWrite(cursor).throw()
        this.length.tryWrite(cursor).throw()

        cursor.tryWrite(this.bytes).throw()

        return Ok.void()
      }, Error)
    }

    static tryRead(cursor: Cursor): Result<UTF8String, Error> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        const value = cursor.tryReadString(length.value).throw()

        return new Ok(new UTF8String(type, value))
      }, Error)
    }
  }
}