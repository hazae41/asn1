import { Base16 } from "@hazae41/base16";
import { BinaryReadError, BinaryWriteError, Readable } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result, Unimplemented } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Type } from "mods/type/type.js";

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
  tryReadInto<ReadOutput, ReadError>(readable: Readable<ReadOutput, ReadError>): Result<ReadOutput, ReadError | BinaryReadError> {
    return Readable.tryReadFromBytes(readable, this.bytes)
  }

  toDER() {
    return new Opaque.DER(this.bytes)
  }

  toString() {
    return `OPAQUE ${Base16.get().tryEncode(this.bytes).unwrap()}`
  }

}

export namespace Opaque {

  export class DER {

    constructor(
      readonly bytes: Bytes
    ) { }

    [Symbol.dispose]() { }

    trySize(): Result<number, never> {
      return new Ok(this.bytes.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return cursor.tryWrite(this.bytes)
    }

    static tryRead(cursor: Cursor): Result<Opaque, BinaryReadError | Unimplemented> {
      return Result.unthrowSync(t => {
        const start = cursor.offset

        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const end = cursor.offset

        cursor.offset = start

        const bytes = cursor.tryRead(end - start + length.value).throw(t)

        return new Ok(new Opaque(type, bytes))
      })
    }

  }
}