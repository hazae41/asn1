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

  static create(value: number) {
    return new Boolean(this.type, value)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<Boolean.DER, never> {
    const type = this.type.tryToDER().inner
    const length = new Length(1).tryToDER().inner

    return new Ok(new Boolean.DER(type, length, this.value))
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
      readonly value: number
    ) { }

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        cursor.tryWriteUint8(this.value).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<Boolean, Error | InvalidLengthError> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        if (length.value !== 1)
          return new Err(new InvalidLengthError(`Boolean`, length.value))

        const value = cursor.tryReadUint8().throw(t)

        return new Ok(new Boolean(type, value))
      })
    }
  }
}