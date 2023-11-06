import { Arrays } from "@hazae41/arrays";
import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";

export class VLQ {
  readonly #class = VLQ

  constructor(
    readonly value: number
  ) { }

  get class() {
    return this.#class
  }

  toDER() {
    let value = this.value

    const values = new Array<number>()

    do {
      values.push(value % 128)
      value = Math.floor(value / 128)
    } while (value)

    values.reverse()

    return new VLQ.DER(this.value, values)
  }

}

export namespace VLQ {

  export class DER {

    constructor(
      readonly value: number,
      readonly values: Array<number>
    ) { }

    toASN1() {
      return new VLQ(this.value)
    }

    sizeOrThrow() {
      return this.values.length
    }

    writeOrThrow(cursor: Cursor) {
      for (let i = 0; i < this.values.length - 1; i++) {
        const bitset = new Bitset(this.values[i], 8)
        cursor.writeUint8OrThrow(bitset.enableBE(0).value)
      }

      cursor.writeUint8OrThrow(Arrays.last(this.values)!)
    }

    static readOrThrow(cursor: Cursor) {
      let value = 0

      const values = new Array<number>()

      while (true) {
        const current = cursor.readUint8OrThrow()

        if (current <= 127) {
          value = (value * 128) + current
          values.push(current)
          break
        }

        const bitset = new Bitset(current, 8)
        const byte = bitset.disableBE(0).value
        value = (value * 128) + byte
        values.push(byte)
      }

      return new DER(value, values)
    }

  }

}