import { Binary } from "libs/binary/binary.js";
import { Bitset } from "libs/bitset/bitset.js";

export class Length {
  readonly class = Length

  constructor(
    readonly value: number
  ) { }

  _values?: Array<number>

  prepare() {
    if (this.value < 128)
      return

    let value = this.value

    const values = new Array<number>()

    do {
      values.push(value % 256)
      value = Math.floor(value / 256)
    } while (value)

    this._values = values.reverse()
  }

  size() {
    if (this.value < 128)
      return 1

    this.prepare()

    const values = this._values

    if (!values)
      throw new Error(`Unprepared values`)

    return 1 + values.length
  }

  write(binary: Binary) {
    if (this.value < 128)
      return binary.writeUint8(this.value)

    const values = this._values

    if (!values)
      throw new Error(`Unprepared values`)

    const count = new Bitset(values.length, 8)
      .enable(7)
      .value

    binary.writeUint8(count)

    for (const value of values)
      binary.writeUint8(value)

    return
  }

  static read(binary: Binary) {
    const first = binary.readUint8()

    if (first < 128)
      return new this(first)

    const count = new Bitset(first, 8)
      .disable(7)
      .value

    let value = 0

    for (let i = 0; i < count; i++)
      value = (value * 256) + binary.readUint8()

    return new this(value)
  }
}