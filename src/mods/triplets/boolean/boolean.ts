import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result, Unimplemented } from "@hazae41/result";
import { InvalidLengthError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
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

  toDER() {
    const type = this.type.toDER()
    const length = new Length(1).toDER()

    return new Boolean.DER(type, length, this.value)
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
      return Triplet.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        cursor.tryWriteUint8(this.value).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<Boolean, BinaryReadError | Unimplemented | InvalidLengthError> {
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