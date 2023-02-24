import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class OctetString {
  readonly #class = OctetString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OCTET_STRING)

  constructor(
    readonly type: Type,
    readonly bytes: Uint8Array
  ) { }

  static new(bytes: Uint8Array) {
    return new this(this.type, bytes)
  }

  get class() {
    return this.#class
  }

  toDER() {
    return new OctetString.DER(this)
  }

  toString() {
    return `OCTET STRING ${Bytes.toHex(this.bytes)}`
  }
}

export namespace OctetString {

  export class DER {
    static inner = OctetString

    constructor(
      readonly inner: OctetString
    ) { }

    #data?: {
      length: Length.DER
    }

    prepare() {
      const length = new Length(this.inner.bytes.length).toDER().prepare()

      this.#data = { length }
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
      const { length } = this.#data

      this.inner.type.toDER().write(cursor)
      length.write(cursor)

      cursor.write(this.inner.bytes)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const buffer = cursor.read(length.value)

      return new this.inner(type, buffer)
    }
  }
}