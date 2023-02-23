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

  readonly DER = new Boolean.DER(this)

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

  toString() {
    return `BOOLEAN ${this.value !== 0}`
  }

}

export namespace Boolean {

  export class DER {
    static parent = Boolean

    constructor(
      readonly parent: Boolean
    ) { }

    #data?: {
      length: Length
    }

    prepare() {
      const length = new Length(1).DER.prepare().parent

      this.#data = { length }
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

      const { length } = this.#data

      this.parent.type.DER.write(cursor)
      length.DER.write(cursor)

      cursor.writeUint8(this.parent.value)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      if (length.value !== 1)
        throw new Error(`Invalid ${this.name} length`)

      const value = cursor.readUint8()

      return new this.parent(type, value)
    }
  }
}