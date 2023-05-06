import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class IA5String {
  readonly #class = IA5String

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.IA5_STRING)

  constructor(
    readonly type: Type,
    readonly value: string
  ) { }

  static create(value: string) {
    return new IA5String(this.type, value)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<IA5String.DER, never> {
    const bytes = Bytes.fromAscii(this.value)

    const type = this.type.tryToDER().inner
    const length = new Length(bytes.length).tryToDER().inner

    return new Ok(new IA5String.DER(type, length, bytes))
  }

  toString() {
    return `IA5String ${this.value}`
  }

}

export namespace IA5String {

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
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        cursor.tryWrite(this.bytes).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<IA5String, Error> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const bytes = cursor.tryRead(length.value).throw(t)
        const value = Bytes.toAscii(bytes)

        return new Ok(new IA5String(type, value))
      })
    }
  }
}