import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result, Unimplemented } from "@hazae41/result";
import { InvalidValueError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
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

  static create(value: Date) {
    return new UTCTime(this.type, value)
  }

  get class() {
    return this.#class
  }

  toDER() {
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

    const type = this.type.toDER()
    const length = new Length(bytes.length).toDER()

    return new UTCTime.DER(type, length, bytes)
  }

  toString() {
    return `UTCTime ${this.value.toUTCString()}`
  }

}

export namespace UTCTime {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly bytes: Bytes
    ) { }

    trySize(): Result<number, never> {
      return Triplet.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        cursor.tryWrite(this.bytes).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<UTCTime, BinaryReadError | Unimplemented | InvalidValueError> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const text = cursor.tryReadUtf8(length.value).throw(t)

        if (text.length !== 13)
          return new Err(new InvalidValueError(`UTCTime`, text))
        if (!text.endsWith("Z"))
          return new Err(new InvalidValueError(`UTCTime`, text))

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
      })
    }

  }
}