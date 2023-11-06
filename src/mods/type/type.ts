import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";
import { Unimplemented } from "@hazae41/result";

export interface TypeLike {
  readonly clazz: number
  readonly wrap: number
  readonly tag: number
}

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

  get byte() {
    return Type.byte(this)
  }

  equals(other: TypeLike) {
    return Type.equals(this, other)
  }

  toDER() {
    return new Type.DER(this.clazz, this.wrap, this.tag)
  }

}

export namespace Type {

  export function equals(a: TypeLike, b: TypeLike) {
    if (a.clazz !== b.clazz)
      return false
    if (a.wrap !== b.wrap)
      return false
    if (a.tag !== b.tag)
      return false
    return true
  }

  export function byte(type: TypeLike) {
    let value = 0
    value |= type.clazz << 6
    value |= type.wrap << 5
    value |= type.tag

    return value
  }

  export class DER {
    static readonly size = 1

    constructor(
      readonly clazz: number,
      readonly wrap: number,
      readonly tag: number
    ) { }

    get byte() {
      return Type.byte(this)
    }

    equals(other: TypeLike) {
      return Type.equals(this, other)
    }

    toASN1() {
      return new Type(this.clazz, this.wrap, this.tag)
    }

    sizeOrThrow() {
      return 1
    }

    writeOrThrow(cursor: Cursor) {
      cursor.writeUint8OrThrow(this.byte)
    }

    static readOrThrow(cursor: Cursor) {
      const type = cursor.readUint8OrThrow()
      const bitset = new Bitset(type, 8)

      const clazz = bitset.first(2).value
      const wrap = Number(bitset.getLE(5))
      const tag = bitset.last(5).value

      if (tag > 30) // TODO
        throw new Unimplemented({ cause: `Type tag > 30` })

      return new DER(clazz, wrap, tag)
    }

  }

}