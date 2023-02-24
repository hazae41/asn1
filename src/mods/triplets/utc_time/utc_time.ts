import { Cursor } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

function pad2(value: number) {
  return value.toString().padStart(2, "0")
}

export class UTCTime {
  readonly #class = UTCTime

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.UTC_TIME)

  constructor(
    readonly type: Type,
    readonly value: Date
  ) { }

  static new(value: Date) {
    return new this(this.type, value)
  }

  get class() {
    return this.#class
  }

  toDER() {
    return new UTCTime.DER(this)
  }

  toString() {
    return `UTCTime ${this.value.toUTCString()}`
  }
}

export namespace UTCTime {

  export class DER {
    static inner = UTCTime

    constructor(
      readonly inner: UTCTime
    ) { }

    #data?: {
      length: Length.DER,
      bytes: Uint8Array
    }

    prepare() {
      const year = this.inner.value.getUTCFullYear()

      const YY = year > 2000
        ? pad2(year - 2000)
        : pad2(year - 1900)

      const MM = pad2(this.inner.value.getUTCMonth() + 1)
      const DD = pad2(this.inner.value.getUTCDate())
      const hh = pad2(this.inner.value.getUTCHours())
      const mm = pad2(this.inner.value.getUTCMinutes())
      const ss = pad2(this.inner.value.getUTCSeconds())

      const bytes = Bytes.fromUtf8(`${YY}${MM}${DD}${hh}${mm}${ss}Z`)
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

      const text = cursor.readString(length.value)

      if (text.length !== 13)
        throw new Error(`Invalid format`)
      if (!text.endsWith("Z"))
        throw new Error(`Invalid format`)

      const YY = Number(text.slice(0, 2))
      const MM = Number(text.slice(2, 4))
      const DD = Number(text.slice(4, 6))
      const hh = Number(text.slice(6, 8))
      const mm = Number(text.slice(8, 10))
      const ss = Number(text.slice(10, 12))

      const year = YY > 50
        ? 1900 + YY
        : 2000 + YY

      const value = new Date()
      value.setUTCFullYear(year, MM - 1, DD)
      value.setUTCHours(hh, mm, ss)
      value.setUTCMilliseconds(0)

      return new this.inner(type, value)
    }

  }
}