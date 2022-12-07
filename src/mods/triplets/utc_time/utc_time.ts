import { Binary } from "libs/binary/binary.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

function pad2(value: number) {
  const text = value.toString()

  if (text.length > 2)
    throw new Error(`Invalid length`)

  if (text.length === 2)
    return text

  return "0" + text
}

export class UTCTime {
  readonly class = UTCTime

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.UTC_TIME)

  constructor(
    readonly value: Date
  ) { }

  get type() {
    return this.class.type
  }

  private _length?: Length

  get length() {
    this.prepare()

    const length = this._length

    if (!length)
      throw new Error(`Unprepared length`)

    return length
  }

  private _buffer?: Buffer

  prepare() {
    const year = this.value.getUTCFullYear()

    const YY = year > 2000
      ? year - 2000
      : year - 1900

    const MM = pad2(this.value.getUTCMonth() + 1)
    const DD = pad2(this.value.getUTCDate())
    const hh = pad2(this.value.getUTCHours())
    const mm = pad2(this.value.getUTCMinutes())
    const ss = pad2(this.value.getUTCSeconds())

    const buffer = Buffer.from(`${YY}${MM}${DD}${hh}${mm}${ss}Z`)

    this._buffer = buffer
    this._length = new Length(buffer.length)
  }

  size() {
    return Triplet.size(this.length)
  }

  write(binary: Binary) {
    this.type.write(binary)

    const length = this._length

    if (!length)
      throw new Error(`Unprepared length`)

    length.write(binary)

    const content = binary.offset

    const buffer = this._buffer

    if (!buffer)
      throw new Error(`Unprepared buffer`)

    binary.write(buffer)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(binary: Binary) {
    const type = Type.read(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(binary)

    const content = binary.offset

    const text = binary.readString(length.value)

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

    const date = new Date()
    date.setUTCFullYear(year, MM - 1, DD)
    date.setUTCHours(hh, mm, ss)
    date.setUTCMilliseconds(0)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(date)
  }

  toString() {
    return `UTCTime ${this.value.toUTCString()}`
  }
}