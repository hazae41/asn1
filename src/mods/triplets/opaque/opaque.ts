import { Cursor } from "@hazae41/binary"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export class Opaque {

  /**
   * An opaque triplet, not resolved yet
   * 
   * Like Unknown but the bytes also contains Type + Length
   * @param bytes 
   */
  constructor(
    readonly type: Type,
    readonly bytes: Uint8Array
  ) { }

  size() {
    return this.bytes.length
  }

  write(cursor: Cursor) {
    cursor.write(this.bytes)
  }

  static read(cursor: Cursor) {
    const start = cursor.offset

    const type = Type.read(cursor)
    const length = Length.read(cursor)

    const end = cursor.offset

    cursor.offset = start

    const bytes = cursor.read(end - start + length.value)

    return new this(type, bytes)
  }

  toString() {
    return `OPAQUE`
  }
}