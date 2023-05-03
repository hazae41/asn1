import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
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

  static new() {
    return new this(this.type)
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
      return Result.unthrowSync(() => {
        this.type.tryWrite(cursor).throw()
        this.length.tryWrite(cursor).throw()

        return Ok.void()
      }, Error)
    }

    static tryRead(cursor: Cursor): Result<Null, Error> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        if (length.value !== 0)
          return Err.error(`Invalid length for Null`)

        return new Ok(new Null(type))
      }, Error)
    }

  }
}