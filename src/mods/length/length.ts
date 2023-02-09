import { Binary } from "@hazae41/binary";
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

  write(binary: Binary) {
    if (this.value < 128)
      return binary.writeUint8(this.value)

    if (!this.#data)
      throw new Error(`Unprepared`)
    const { values } = this.#data

    const count = new Bitset(values.length, 8)
      .enableBE(0)
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
      .disableBE(0)
      .value

    let value = 0

    for (let i = 0; i < count; i++)
      value = (value * 256) + binary.readUint8()

    return new this(value)
  }
}