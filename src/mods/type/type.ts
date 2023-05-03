import { Writable } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";

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
    return new Type.DER(this)
  }

}

export namespace Type {

  export class DER {
    static inner = Type

    constructor(
      readonly inner: Type
    ) { }

    static size() {
      return 1
    }

    trySize(): Result<number, never> {
      return new Ok(1)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      let value = 0
      value |= this.inner.clazz << 6
      value |= this.inner.wrap << 5
      value |= this.inner.tag

      return cursor.tryWriteUint8(value)
    }

    static tryRead(cursor: Cursor): Result<Type, Error> {
      return Result.unthrowSync(() => {
        const type = cursor.tryReadUint8().throw()
        const bitset = new Bitset(type, 8)

        const clazz = bitset.first(2).value
        const wrap = Number(bitset.getLE(5))
        const tag = bitset.last(5).value

        if (tag > 30) // TODO
          return Err.error(`Unimplemented tag`)

        return new Ok(new this.inner(clazz, wrap, tag))
      }, Error)
    }

    get byte(): Result<number, Error> {
      return Writable.tryWriteToBytes(this).mapSync(x => x[0])
    }

  }

}