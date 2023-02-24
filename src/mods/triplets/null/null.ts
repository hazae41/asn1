import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Null {
  readonly #class = Null

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.NULL)

  readonly DER = new Null.DER(this)

  constructor(
    readonly type: Type.DER
  ) { }

  static new() {
    return new this(this.type.toDER())
  }

  get class() {
    return this.#class
  }

  toString() {
    return `NULL`
  }
}

export namespace Null {

  export class DER {
    static parent = Null

    constructor(
      readonly parent: Null
    ) { }

    #data?: {
      length: Length.DER
    }

    prepare() {
      const length = Length.DER.new(0).prepare()

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

      this.parent.type.write(cursor)
      length.write(cursor)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      if (length.inner.value !== 0)
        throw new Error(`Invalid ${this.name} length`)

      return new this.parent(type)
    }

  }
}