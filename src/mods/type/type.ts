import { Cursor } from "@hazae41/cursor";
import { Unimplemented } from "@hazae41/result";

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
    readonly byte: number,
    readonly clazz: number,
    readonly wrap: number,
    readonly tag: number
  ) { }

  static from(clazz: number, wrap: number, tag: number) {
    let byte = 0
    byte |= clazz << 6
    byte |= wrap << 5
    byte |= tag

    return new Type(byte, clazz, wrap, tag)
  }

  equals(other: Type) {
    return this.byte === other.byte
  }

  toDER() {
    return new Type.DER(this.byte, this.clazz, this.wrap, this.tag)
  }

}

export namespace Type {

  export class DER extends Type {
    static readonly size = 1

    constructor(
      readonly byte: number,
      readonly clazz: number,
      readonly wrap: number,
      readonly tag: number
    ) {
      super(byte, clazz, wrap, tag)
    }

    toASN1() {
      return new Type(this.byte, this.clazz, this.wrap, this.tag)
    }

    sizeOrThrow() {
      return 1
    }

    writeOrThrow(cursor: Cursor) {
      cursor.writeUint8OrThrow(this.byte)
    }

    static readOrThrow(cursor: Cursor) {
      const byte = cursor.readUint8OrThrow()

      const clazz = byte >> 6
      const wrap = (byte >> 5) & 1
      const tag = byte & 0b11111

      if (tag > 30) // TODO
        throw new Unimplemented({ cause: `Type tag > 30` })

      return new DER(byte, clazz, wrap, tag)
    }

  }

}