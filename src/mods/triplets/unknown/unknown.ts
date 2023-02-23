import { Cursor } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class Unknown {
  readonly #class = Unknown

  readonly DER = new Unknown.DER(this)

  /**
   * An unknown triplet, not resolved
   * 
   * Like OpaqueTriplet, but the bytes do not contain Type + Length
   * @param type 
   * @param bytes 
   */
  constructor(
    readonly type: Type,
    readonly bytes: Uint8Array,
  ) { }

  get class() {
    return this.#class
  }

  toString() {
    return `UNKNOWN`
  }
}

export namespace Unknown {

  export class DER {
    static parent = Unknown

    constructor(
      readonly parent: Unknown
    ) { }

    #data?: {
      length: Length
    }

    prepare() {
      const length = new Length(this.parent.bytes.length).DER.prepare().parent

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

      cursor.write(this.parent.bytes)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const bytes = cursor.read(length.value)

      return new this.parent(type, bytes)
    }

  }
}