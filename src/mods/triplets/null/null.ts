import { Cursor } from "@hazae41/cursor";
import { Err } from "@hazae41/result";
import { InvalidLengthError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class Null {

  static readonly type = Type.from(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.NULL)

  constructor(
    readonly type: Type
  ) { }

  static create() {
    return new Null(this.type)
  }

  toDER() {
    return Null.DER.from(this)
  }

  toString() {
    return `NULL`
  }

}

export namespace Null {

  export class DER extends Null {

    static readonly length = new Length(0).toDER()

    constructor(
      readonly type: Type.DER
    ) {
      super(type)
    }

    get length() {
      return DER.length
    }

    static from(asn1: Null) {
      return new DER(asn1.type.toDER())
    }

    sizeOrThrow() {
      return Triplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      if (length.value !== 0)
        return new Err(new InvalidLengthError(`Null`, length.value))

      return new Null(type)
    }

  }
}