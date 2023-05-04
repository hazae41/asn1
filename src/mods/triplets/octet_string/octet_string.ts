import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class OctetString {
  readonly #class = OctetString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OCTET_STRING)

  constructor(
    readonly type: Type,
    readonly bytes: Bytes
  ) { }

  static new(bytes: Bytes) {
    return new this(this.type, bytes)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<OctetString.DER, never> {
    const type = this.type.tryToDER().inner
    const length = new Length(this.bytes.length).tryToDER().inner

    return new Ok(new OctetString.DER(type, length, this.bytes))
  }

  toString() {
    return `OCTET STRING ${Bytes.toHex(this.bytes)}`
  }
}

export namespace OctetString {

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

    static tryRead(cursor: Cursor): Result<OctetString, Error> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        const buffer = cursor.tryRead(length.value).throw()

        return new Ok(new OctetString(type, buffer))
      }, Error)
    }
  }
}