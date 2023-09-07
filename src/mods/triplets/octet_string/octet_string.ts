import { Base16 } from "@hazae41/base16";
import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result, Unimplemented } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
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

  static create(bytes: Bytes) {
    return new OctetString(this.type, bytes)
  }

  get class() {
    return this.#class
  }

  toDER() {
    const type = this.type.toDER()
    const length = new Length(this.bytes.length).toDER()

    return new OctetString.DER(type, length, this.bytes)
  }

  toString() {
    return `OCTET STRING ${Base16.get().tryEncode(this.bytes).unwrap()}`
  }
}

export namespace OctetString {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly bytes: Bytes
    ) { }

    [Symbol.dispose]() { }

    trySize(): Result<number, never> {
      return Triplet.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        cursor.tryWrite(this.bytes).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<OctetString, BinaryReadError | Unimplemented> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const buffer = cursor.tryRead(length.value).throw(t)

        return new Ok(new OctetString(type, buffer))
      })
    }
  }
}