import { Cursor } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";

export class VLQ {
  readonly #class = VLQ

  constructor(
    readonly value: number
  ) { }

  get class() {
    return this.#class
  }

  toDER() {
    return new VLQ.DER(this)
  }

}

export namespace VLQ {

  export class DER {
    static inner = VLQ

    constructor(
      readonly inner: VLQ
    ) { }

    static new(value: number) {
      const inner = new this.inner(value)

      return new this(inner)
    }

    #data?: {
      values: Array<number>
    }

    prepare() {
      let value = this.inner.value

      const values = new Array<number>()

      do {
        values.push(value % 128)
        value = Math.floor(value / 128)
      } while (value)

      values.reverse()
      this.#data = { values }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { values } = this.#data

      return values.length
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { values } = this.#data

      for (let i = 0; i < values.length - 1; i++) {
        const bitset = new Bitset(values[i], 8)
        cursor.writeUint8(bitset.enableBE(0).value)
      }

      cursor.writeUint8(values[values.length - 1])
    }

    static read(cursor: Cursor) {
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

      const inner = new this.inner(value)
      return new this(inner)
    }

  }

}