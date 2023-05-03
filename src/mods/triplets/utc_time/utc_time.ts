import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
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

  tryToDER(): Result<UTCTime.DER, never> {
    const year = this.value.getUTCFullYear()

    const YY = year > 2000
      ? pad2(year - 2000)
      : pad2(year - 1900)

    const MM = pad2(this.value.getUTCMonth() + 1)
    const DD = pad2(this.value.getUTCDate())
    const hh = pad2(this.value.getUTCHours())
    const mm = pad2(this.value.getUTCMinutes())
    const ss = pad2(this.value.getUTCSeconds())

    const bytes = Bytes.fromUtf8(`${YY}${MM}${DD}${hh}${mm}${ss}Z`)

    const type = this.type.tryToDER().inner
    const length = new Length(bytes.length).tryToDER().inner

    return new Ok(new UTCTime.DER(type, length, bytes))
  }

  toString() {
    return `UTCTime ${this.value.toUTCString()}`
  }

}

export namespace UTCTime {

  export class DER {
    static inner = UTCTime

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly bytes: Bytes
    ) { }

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        this.type.tryWrite(cursor).throw()
        this.length.tryWrite(cursor).throw()

        cursor.tryWrite(this.bytes).throw()

        return Ok.void()
      }, Error)
    }

    static tryRead(cursor: Cursor): Result<UTCTime, Error> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        const text = cursor.tryReadString(length.value).throw()

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

        return new Ok(new UTCTime(type, value))
      }, Error)
    }

  }
}