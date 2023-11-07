import { Base16 } from "@hazae41/base16";
import { ReadError, Readable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Boolean } from "mods/triplets/boolean/boolean.js";
import { Integer } from "mods/triplets/integer/integer.js";
import { Type } from "mods/type/type.js";
import { BitString } from "../bit_string/bit_string.js";

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
    readonly bytes: Uint8Array
  ) { }

  toDER() {
    return Opaque.DER.from(this)
  }

  toString() {
    return `OPAQUE ${Base16.get().tryEncode(this.bytes).unwrap()}`
  }

  readIntoOrThrow<T extends Readable.Infer<T>>(readable: T): Readable.Output<T> {
    return Readable.readFromBytesOrThrow(readable, this.bytes)
  }

  tryReadInto<T extends Readable.Infer<T>>(readable: T): Result<Readable.Output<T>, ReadError> {
    return Readable.tryReadFromBytes(readable, this.bytes)
  }

}

export namespace Opaque {

  export class DER extends Opaque {

    constructor(
      readonly type: Type.DER,
      readonly bytes: Uint8Array
    ) {
      super(type, bytes)
    }

    static from(asn1: Opaque) {
      return new DER(asn1.type.toDER(), asn1.bytes)
    }

    resolveOrThrow() {
      if (this.type.equals(Boolean.DER.type))
        return this.readIntoOrThrow(Boolean.DER)
      if (this.type.equals(Integer.DER.type))
        return this.readIntoOrThrow(Integer.DER)
      if (this.type.equals(BitString.DER.type))
        return this.readIntoOrThrow(BitString.DER)
      return this
    }

    sizeOrThrow() {
      return this.bytes.length
    }

    writeOrThrow(cursor: Cursor) {
      cursor.writeOrThrow(this.bytes)
    }

    static readOrThrow(cursor: Cursor) {
      const start = cursor.offset

      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      const end = cursor.offset

      cursor.offset = start

      const content = cursor.readOrThrow(end - start + length.value)
      const bytes = new Uint8Array(content)

      return new DER(type, bytes)
    }

  }
}