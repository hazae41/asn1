import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

export class PrintableString {
  readonly #class = PrintableString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.PRINTABLE_STRING)

  readonly DER = new PrintableString.DER(this)

  constructor(
    readonly type: Type.DER,
    readonly value: string
  ) { }

  static new(value: string) {
    return new this(this.type.toDER(), value)
  }

  get class() {
    return this.#class
  }

  toString() {
    return `PrintableString ${this.value}`
  }
}

export namespace PrintableString {

  export class DER {
    static parent = PrintableString

    constructor(
      readonly parent: PrintableString
    ) { }

    #data?: {
      length: Length.DER,
      bytes: Uint8Array
    }

    prepare() {
      if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(this.parent.value))
        throw new Error(`Invalid value`)

      const bytes = Bytes.fromUtf8(this.parent.value)
      const length = Length.DER.new(bytes.length).prepare()

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

      this.parent.type.write(cursor)
      length.write(cursor)

      cursor.write(bytes)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const value = cursor.readString(length.inner.value)

      if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
        throw new Error(`Invalid value`)

      return new this.parent(type, value)
    }
  }
}