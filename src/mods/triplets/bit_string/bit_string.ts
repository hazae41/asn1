import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class BitString {
  readonly #class = BitString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BIT_STRING)

  constructor(
    readonly type: Type,
    readonly padding: number,
    readonly bytes: Uint8Array
  ) { }

  static new(padding: number, bytes: Uint8Array) {
    return new this(this.type, padding, bytes)
  }

  get class() {
    return this.#class
  }

  toDER() {
    return new BitString.DER(this)
  }

  toString() {
    const bignum = BigInt("0x" + Bytes.toHex(this.bytes))
    const cursor = bignum.toString(2).padStart(this.bytes.length * 8, "0")

    return `BITSTRING ${cursor.slice(0, cursor.length - this.padding)}`
  }

}

export namespace BitString {

  export class DER {
    static inner = BitString

    constructor(
      readonly inner: BitString
    ) { }

    #data?: {
      length: Length.DER
    }

    prepare() {
      const length = new Length(1 + this.inner.bytes.length).toDER().prepare()

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

      cursor.writeUint8(this.inner.padding)
      cursor.write(this.inner.bytes)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const content = cursor.read(length.value)
      const subcursor = new Cursor(content)

      const padding = subcursor.readUint8()
      const bytes = subcursor.read(subcursor.remaining)

      return new this.inner(type, padding, bytes)
    }

  }
}