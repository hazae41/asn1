import { Binary } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";

export class VLQ {

  constructor(
    readonly value: number
  ) { }

  #values?: Array<number>

  prepare() {
    let value = this.value

    const values = new Array<number>()

    do {
      values.push(value % 128)
      value = Math.floor(value / 128)
    } while (value)

    this.#values = values.reverse()
  }

  size() {
    this.prepare()

    const values = this.#values

    if (!values)
      throw new Error(`Unprepared values`)

    return values.length
  }

  write(binary: Binary) {
    const values = this.#values

    if (!values)
      throw new Error(`Unprepared values`)

    for (let i = 0; i < values.length - 1; i++) {
      const bitset = new Bitset(values[i], 8)
      binary.writeUint8(bitset.enableBE(0).value)
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
      values.push(bitset.disableBE(0).value)
    }

    let value = 0

    for (let i = 0; i < values.length; i++)
      value = (value * 128) + values[i]

    return new this(value)
  }

}