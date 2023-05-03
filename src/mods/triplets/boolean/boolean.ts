import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
import { InvalidLengthError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Boolean {
  readonly #class = Boolean

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BOOLEAN)

  constructor(
    readonly type: Type,
    readonly value: number
  ) { }

  static new(value: number) {
    return new this(this.type, value)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<Boolean.DER, never> {
    const type = this.type.tryToDER().inner
    const length = new Length(1).tryToDER().inner

    return new Ok(new Boolean.DER(type, length, this))
  }

  toString() {
    return `BOOLEAN ${this.value !== 0}`
  }

}

export namespace Boolean {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly inner: Boolean
    ) { }

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        this.type.tryWrite(cursor).throw()
        this.length.tryWrite(cursor).throw()

        cursor.tryWriteUint8(this.inner.value).throw()

        return Ok.void()
      }, Error)
    }

    static tryRead(cursor: Cursor): Result<Boolean, Error | InvalidLengthError> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        if (length.value !== 1)
          return new Err(new InvalidLengthError(`Boolean`, length.value))

        const value = cursor.tryReadUint8().throw()

        return new Ok(new Boolean(type, value))
      }, Error)
    }
  }
}