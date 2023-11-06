import { Cursor } from "@hazae41/cursor";
import { InvalidLengthError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class Boolean {

  static readonly type = Type.from(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BOOLEAN)

  constructor(
    readonly type: Type,
    readonly value: number
  ) { }

  static create(value: number) {
    return new Boolean(this.type, value)
  }

  toDER() {
    return Boolean.DER.from(this)
  }

  toString() {
    return `BOOLEAN ${this.value !== 0}`
  }

}

export namespace Boolean {

  export class DER extends Boolean {

    static readonly type = Boolean.type.toDER()
    static readonly length = new Length(1).toDER()

    constructor(
      readonly type: Type.DER,
      readonly value: number
    ) {
      super(type, value)
    }

    get length() {
      return DER.length
    }

    static from(asn1: Boolean) {
      return new DER(asn1.type.toDER(), asn1.value)
    }

    sizeOrThrow() {
      return Triplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      cursor.writeUint8OrThrow(this.value)
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      if (length.value !== this.length.value)
        throw new InvalidLengthError(`Boolean`, length.value)

      const value = cursor.readUint8OrThrow()

      return new DER(type, value)
    }

  }

}