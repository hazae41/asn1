import { Binary } from "@hazae41/binary";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class Unknown {
  readonly #class = Unknown

  constructor(
    readonly type: Type,
    readonly bytes: Uint8Array,
  ) { }

  private _length?: Length

  get length() {
    this.prepare()

    const length = this._length

    if (!length)
      throw new Error(`Unprepared length`)

    return length
  }

  prepare() {
    this._length = new Length(this.bytes.length)
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

    binary.write(this.bytes)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(binary: Binary) {
    const type = Type.read(binary)

    const length = Length.read(binary)

    const start = binary.offset

    const buffer = binary.read(length.value)

    if (binary.offset - start !== length.value)
      throw new Error(`Invalid length`)

    return new this(type, buffer)
  }

  toString() {
    return `UNKNOWN`
  }
}