import { Cursor } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";

export class Length {

  constructor(
    readonly value: number
  ) { }

  #data?: {
    values: Array<number>
  }

  prepare() {
    if (this.value < 128)
      return

    let value = this.value

    const values = new Array<number>()

    do {
      values.push(value % 256)
      value = Math.floor(value / 256)
    } while (value)

    values.reverse()

    return this.#data = { values }
  }

  size() {
    if (this.value < 128)
      return 1
    const { values } = this.prepare()!
    return 1 + values.length
  }

  write(cursor: Cursor) {
    if (this.value < 128)
      return cursor.writeUint8(this.value)

    if (!this.#data)
      throw new Error(`Unprepared`)
    const { values } = this.#data

    const count = new Bitset(values.length, 8)
      .enableBE(0)
      .value

    cursor.writeUint8(count)

    for (const value of values)
      cursor.writeUint8(value)

    return
  }

  static read(cursor: Cursor) {
    const first = cursor.readUint8()

    if (first < 128)
      return new this(first)

    const count = new Bitset(first, 8)
      .disableBE(0)
      .value

    let value = 0

    for (let i = 0; i < count; i++)
      value = (value * 256) + cursor.readUint8()

    return new this(value)
  }
}