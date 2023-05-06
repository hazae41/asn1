import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
import { InvalidLengthError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Null {
  readonly #class = Null

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.NULL)

  constructor(
    readonly type: Type
  ) { }

  static create() {
    return new Null(this.type)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<Null.DER, never> {
    const type = this.type.tryToDER().inner
    const length = new Length(0).tryToDER().inner

    return new Ok(new Null.DER(type, length))
  }

  toString() {
    return `NULL`
  }

}

export namespace Null {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER
    ) { }

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<Null, Error | InvalidLengthError> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        if (length.value !== 0)
          return new Err(new InvalidLengthError(`Null`, length.value))

        return new Ok(new Null(type))
      })
    }

  }
}