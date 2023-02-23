import { Cursor } from "@hazae41/binary";
import { Bitset } from "@hazae41/bitset";

export class Length {
  readonly #class = Length

  readonly DER = new Length.DER(this)

  constructor(
    readonly value: number
  ) { }

  get class() {
    return this.#class
  }

}

export namespace Length {

  export class DER {
    static parent = Length

    constructor(
      readonly parent: Length
    ) { }

    #data?: {
      values: Array<number>
    }

    prepare() {
      if (this.parent.value < 128)
        return this

      let value = this.parent.value

      const values = new Array<number>()

      do {
        values.push(value % 256)
        value = Math.floor(value / 256)
      } while (value)

      values.reverse()

      this.#data = { values }
      return this
    }

    size() {
      if (this.parent.value < 128)
        return 1

      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { values } = this.#data

      return 1 + values.length
    }

    write(cursor: Cursor) {
      if (this.parent.value < 128)
        return cursor.writeUint8(this.parent.value)

      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
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
        return new this.parent(first)

      const count = new Bitset(first, 8)
        .disableBE(0)
        .value

      let value = 0

      for (let i = 0; i < count; i++)
        value = (value * 256) + cursor.readUint8()

      return new this.parent(value)
    }
  }

}
