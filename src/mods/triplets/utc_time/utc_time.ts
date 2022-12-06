import { Binary } from "libs/binary/binary.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

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

  get length() {
    return new Length(0) // TODO
  }

  size() {
    return Triplet.size(this.length)
  }

  write(binary: Binary) {
    this.type.write(binary)

    const { length } = this

    length.write(binary)

    const content = binary.offset

    // TODO

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
    date.setUTCFullYear(year, MM, DD)
    date.setUTCHours(hh, mm, ss)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(date)
  }

  toString() {
    return `UTCTime ${this.value.toUTCString()}`
  }
}