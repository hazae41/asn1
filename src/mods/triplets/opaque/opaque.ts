import { Cursor, Readable } from "@hazae41/binary"
import { Bytes } from "@hazae41/bytes"
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
    readonly bytes: Uint8Array
  ) { }

  /**
   * Zero-copy transform into another type
   */
  into<T>(readable: Readable<T>) {
    return Readable.fromBytes(readable, this.bytes)
  }

  toDER() {
    return new Opaque.DER(this)
  }

  toString() {
    return `OPAQUE ${Bytes.toHex(this.bytes)}`
  }
}

export namespace Opaque {

  export class DER {
    static inner = Opaque

    constructor(
      readonly inner: Opaque
    ) { }

    prepare() {
      return this
    }

    size() {
      return this.inner.bytes.length
    }

    write(cursor: Cursor) {
      cursor.write(this.inner.bytes)
    }

    static read(cursor: Cursor) {
      const start = cursor.offset

      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const end = cursor.offset

      cursor.offset = start

      const bytes = cursor.read(end - start + length.value)

      return new this.inner(type, bytes)
    }
  }
}