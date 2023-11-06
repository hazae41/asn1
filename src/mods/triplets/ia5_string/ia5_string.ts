import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class IA5String {

  static readonly type = Type.from(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.IA5_STRING)

  constructor(
    readonly type: Type,
    readonly length: Length,
    readonly value: string,
    readonly bytes: Bytes
  ) { }

  static create(value: string) {
    const bytes = Bytes.fromAscii(value)
    const length = new Length(bytes.length).toDER()

    return new IA5String(this.type, length, value, bytes)
  }

  toDER() {
    const bytes = Bytes.fromAscii(this.value)

    const type = this.type.toDER()
    const length = new Length(bytes.length).toDER()

    return new IA5String.DER(type, length, this.value, bytes)
  }

  toString() {
    return `IA5String ${this.value}`
  }

}

export namespace IA5String {

  export class DER extends IA5String {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: string,
      readonly bytes: Bytes
    ) {
      super(type, length, value, bytes)
    }

    sizeOrThrow() {
      return Triplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      cursor.writeOrThrow(this.bytes)
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      const content = cursor.readOrThrow(length.value)

      const bytes = new Uint8Array(content)
      const value = Bytes.toAscii(bytes)

      return new DER(type, length, value, bytes)
    }

  }

}