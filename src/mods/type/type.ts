import { Bitset } from "@hazae41/bitset";
import { Cursor, CursorReadUnknownError, CursorWriteUnknownError } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
import { Unimplemented } from "mods/errors/errors.js";

export class Type {

  static clazzes = {
    UNIVERSAL: 0,
    APPLICATION: 1,
    CONTEXT: 2,
    PRIVATE: 3
  } as const

  static wraps = {
    PRIMITIVE: 0,
    CONSTRUCTED: 1
  } as const

  static tags = {
    BOOLEAN: 1,
    INTEGER: 2,
    BIT_STRING: 3,
    OCTET_STRING: 4,
    NULL: 5,
    OBJECT_IDENTIFIER: 6,
    UTF8_STRING: 12,
    SEQUENCE: 16,
    SET: 17,
    PRINTABLE_STRING: 19,
    IA5_STRING: 22,
    UTC_TIME: 23
  } as const

  constructor(
    readonly clazz: number,
    readonly wrap: number,
    readonly tag: number
  ) { }

  equals(other: Type) {
    if (this.clazz !== other.clazz)
      return false
    if (this.wrap !== other.wrap)
      return false
    if (this.tag !== other.tag)
      return false
    return true
  }

  toDER() {
    return new Type.DER(this.clazz, this.wrap, this.tag)
  }

  get byte(): number {
    let value = 0
    value |= this.clazz << 6
    value |= this.wrap << 5
    value |= this.tag

    return value
  }

}

export namespace Type {

  export class DER {
    static readonly size = 1

    constructor(
      readonly clazz: number,
      readonly wrap: number,
      readonly tag: number
    ) { }

    trySize(): Result<number, never> {
      return new Ok(1)
    }

    tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError> {
      let value = 0
      value |= this.clazz << 6
      value |= this.wrap << 5
      value |= this.tag

      return cursor.tryWriteUint8(value)
    }

    static tryRead(cursor: Cursor): Result<Type, CursorReadUnknownError | Unimplemented> {
      return Result.unthrowSync(t => {
        const type = cursor.tryReadUint8().throw(t)
        const bitset = new Bitset(type, 8)

        const clazz = bitset.first(2).value
        const wrap = Number(bitset.getLE(5))
        const tag = bitset.last(5).value

        if (tag > 30) // TODO
          return new Err(new Unimplemented(`Type tag > 30`))

        return new Ok(new Type(clazz, wrap, tag))
      })
    }

  }

}