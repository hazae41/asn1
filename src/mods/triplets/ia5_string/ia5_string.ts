import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class IA5String {
  readonly #class = IA5String

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.IA5_STRING)

  readonly DER = new IA5String.DER(this)

  constructor(
    readonly type: Type,
    readonly value: string
  ) { }

  static new(value: string) {
    return new this(this.type, value)
  }

  get class() {
    return this.#class
  }

  toString() {
    return `IA5String ${this.value}`
  }
}

export namespace IA5String {

  export class DER {
    static parent = IA5String

    constructor(
      readonly parent: IA5String
    ) { }

    #data?: {
      length: Length,
      bytes: Uint8Array
    }

    prepare() {
      const bytes = Bytes.fromAscii(this.parent.value)
      const length = new Length(bytes.length).DER.prepare().parent

      this.#data = { length, bytes }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { length } = this.#data

      return Triplets.size(length)
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { length, bytes } = this.#data

      this.parent.type.DER.write(cursor)
      length.DER.write(cursor)

      cursor.write(bytes)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const bytes = cursor.read(length.value)
      const value = Bytes.toAscii(bytes)

      return new this.parent(type, value)
    }
  }
}