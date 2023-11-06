import { Cursor } from "@hazae41/cursor";
import { InvalidLengthError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class Boolean {
  readonly #class = Boolean

  static type = Type.from(
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

  get class() {
    return this.#class
  }

  toDER() {
    const type = this.type.toDER()
    const length = new Length(1).toDER()

    return new Boolean.DER(type, length, this.value)
  }

  toString() {
    return `BOOLEAN ${this.value !== 0}`
  }

}

export namespace Boolean {

  export class DER extends Boolean {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: number
    ) {
      super(type, value)
    }

    toASN1() {
      return new Boolean(this.type.toASN1(), this.value)
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

      if (length.value !== 1)
        throw new InvalidLengthError(`Boolean`, length.value)

      const value = cursor.readUint8OrThrow()

      return new DER(type, length, value)
    }

  }

}