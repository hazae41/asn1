import { Binary } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";

export class VLQ {

  constructor(
    readonly value: number
  ) { }

  #data?: {
    values: Array<number>
  }

  prepare() {
    let value = this.value

    const values = new Array<number>()

    do {
      values.push(value % 128)
      value = Math.floor(value / 128)
    } while (value)

    values.reverse()
    return this.#data = { values }
  }

  size() {
    const { values } = this.prepare()
    return values.length
  }

  write(cursor: Binary) {
    if (!this.#data)
      throw new Error(`Unprepared`)
    const { values } = this.#data

    for (let i = 0; i < values.length - 1; i++) {
      const bitset = new Bitset(values[i], 8)
      cursor.writeUint8(bitset.enableBE(0).value)
    }

    cursor.writeUint8(values[values.length - 1])
  }

  static read(cursor: Binary) {
    const values = new Array<number>()

    while (true) {
      const current = cursor.readUint8()

      if (current <= 127) {
        values.push(current)
        break
      }

      const bitset = new Bitset(current, 8)
      values.push(bitset.disableBE(0).value)
    }

    let value = 0

    for (let i = 0; i < values.length; i++)
      value = (value * 128) + values[i]

    return new this(value)
  }

}