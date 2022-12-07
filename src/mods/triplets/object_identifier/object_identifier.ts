import { Binary } from "libs/binary/binary.js";
import { Bitset } from "libs/bitset/bitset.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

export class VLQ {

  constructor(
    readonly value: number
  ) { }

  private _values?: Array<number>

  prepare() {
    let value = this.value

    const values = new Array<number>()

    do {
      values.push(value % 128)
      value = Math.floor(value / 128)
    } while (value)

    this._values = values.reverse()
  }

  size() {
    this.prepare()

    const values = this._values

    if (!values)
      throw new Error(`Unprepared values`)

    return values.length
  }

  write(binary: Binary) {
    const values = this._values

    if (!values)
      throw new Error(`Unprepared values`)

    for (let i = 0; i < values.length - 1; i++) {
      const bitset = new Bitset(values[i], 8)
      binary.writeUint8(bitset.enable(7).value)
    }

    binary.writeUint8(values[values.length - 1])
  }

  static read(binary: Binary) {
    const values = new Array<number>()

    while (true) {
      const current = binary.readUint8()

      if (current <= 127) {
        values.push(current)
        break
      }

      const bitset = new Bitset(current, 8)
      values.push(bitset.disable(7).value)
    }

    let value = 0

    for (let i = 0; i < values.length; i++)
      value = (value * 128) + values[i]

    return new this(value)
  }

}

export class ObjectIdentifier {
  readonly class = ObjectIdentifier

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OBJECT_IDENTIFIER)

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

  private _header?: [number, number]
  private _values?: Array<VLQ>

  prepare() {
    const values = new Array<VLQ>()
    const texts = this.value.split(".")

    const first = Number(texts[0])
    const second = Number(texts[1])
    this._header = [first, second]

    let size = 1

    for (let i = 2; i < texts.length; i++) {
      const vlq = new VLQ(Number(texts[i]))
      size += vlq.size()
      values.push(vlq)
    }

    this._values = values
    this._length = new Length(size)
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

    const header = this._header

    if (!header)
      throw new Error(`Unprepared header`)

    const [first, second] = header
    binary.writeUint8((first * 40) + second)

    const values = this._values

    if (!values)
      throw new Error(`Unprepared values`)

    for (const value of values)
      value.write(binary)

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

    const header = binary.readUint8()
    const first = Math.floor(header / 40)
    const second = header % 40

    const values = [first, second]

    while (binary.offset - content < length.value)
      values.push(VLQ.read(binary).value)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(values.join("."))
  }

  toString() {
    return `OBJECT IDENTIFIER ${this.value}`
  }
}