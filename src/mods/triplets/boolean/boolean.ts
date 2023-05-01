import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Boolean {
  readonly #class = Boolean

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BOOLEAN)

  constructor(
    readonly type: Type,
    readonly value: number
  ) { }

  static new(value: number) {
    return new this(this.type, value)
  }

  get class() {
    return this.#class
  }

  toDER() {
    return new Boolean.DER(this)
  }

  toString() {
    return `BOOLEAN ${this.value !== 0}`
  }

}

export namespace Boolean {

  export class DER {
    static inner = Boolean

    constructor(
      readonly inner: Boolean
    ) { }

    #data?: {
      length: Length.DER
    }

    prepare() {
      const length = new Length(1).toDER().prepare()

      this.#data = { length }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { length } = this.#data

      return Triplets.trySize(length)
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)

      const { length } = this.#data

      this.inner.type.toDER().write(cursor)
      length.write(cursor)

      cursor.writeUint8(this.inner.value)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      if (length.value !== 1)
        throw new Error(`Invalid ${this.name} length`)

      const value = cursor.readUint8()

      return new this.inner(type, value)
    }
  }
}