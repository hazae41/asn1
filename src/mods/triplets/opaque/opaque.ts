import { Readable } from "@hazae41/binary"
import { Bytes } from "@hazae41/bytes"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export class Opaque {

  /**
   * An opaque triplet
   * @param bytes 
   */
  constructor(
    /**
     * Preread triplet type
     */
    readonly type: Type,
    /**
     * The whole triplet (type + length + value)
     */
    readonly bytes: Bytes
  ) { }

  /**
   * Zero-copy transform into another type
   */
  tryInto<T>(readable: Readable<T>): Result<T, Error> {
    return Readable.tryReadFromBytes(readable, this.bytes)
  }

  tryToDER(): Result<Opaque.DER, never> {
    return new Ok(new Opaque.DER(this.bytes))
  }

  toString() {
    return `OPAQUE ${Bytes.toHex(this.bytes)}`
  }

}

export namespace Opaque {

  export class DER {
    static inner = Opaque

    constructor(
      readonly bytes: Bytes
    ) { }

    trySize(): Result<number, never> {
      return new Ok(this.bytes.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return cursor.tryWrite(this.bytes)
    }

    static tryRead(cursor: Cursor): Result<Opaque, Error> {
      return Result.unthrowSync(() => {
        const start = cursor.offset

        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        const end = cursor.offset

        cursor.offset = start

        const bytes = cursor.tryRead(end - start + length.value).throw()

        return new Ok(new Opaque(type, bytes))
      }, Error)
    }
  }
}