import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class UTF8String {
  readonly #class = UTF8String

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.UTF8_STRING)

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

  toDER() {
    return new UTF8String.DER(this)
  }

  toString() {
    return `UTF8String ${this.value}`
  }
}

export namespace UTF8String {

  export class DER {
    static inner = UTF8String

    constructor(
      readonly inner: UTF8String
    ) { }

    #data?: {
      length: Length.DER
      bytes: Uint8Array
    }

    prepare() {
      const bytes = Bytes.fromUtf8(this.inner.value)
      const length = new Length(bytes.length).toDER().prepare()

      this.#data = { length, bytes }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { length } = this.#data

      return Triplets.size(length)
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { length, bytes } = this.#data

      this.inner.type.toDER().write(cursor)
      length.write(cursor)

      cursor.write(bytes)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const value = cursor.readString(length.value)

      return new this.inner(type, value)
    }
  }
}