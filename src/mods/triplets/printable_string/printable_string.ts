import { Binary } from "libs/binary/binary.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class PrintableString {
  readonly class = PrintableString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.PRINTABLE_STRING)

  constructor(
    readonly value: string
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
    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(this.value))
      throw new Error(`Invalid value`)

    const buffer = Buffer.from(this.value)

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

    const value = binary.readString(length.value)

    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
      throw new Error(`Invalid value`)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(value)
  }

  toString() {
    return `PrintableString ${this.value}`
  }
}