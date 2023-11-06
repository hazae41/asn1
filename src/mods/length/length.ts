import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";

export class Length {
  readonly #class = Length

  constructor(
    readonly value: number
  ) { }

  get class() {
    return this.#class
  }

  toDER() {
    if (this.value < 128)
      return new Length.DER.Short(this.value)

    let floor = this.value

    const values = new Array<number>()

    do {
      values.push(floor % 256)
      floor = Math.floor(floor / 256)
    } while (floor)

    values.reverse()

    return new Length.DER.Long(this.value, values)
  }

}

export namespace Length {

  export type DER =
    | DER.Short
    | DER.Long

  export namespace DER {

    export function readOrThrow(cursor: Cursor) {
      const first = cursor.readUint8OrThrow()

      if (first < 128)
        return new Short(first)

      const count = new Bitset(first, 8).disableBE(0).value

      let value = 0

      const values = new Array<number>()

      for (let i = 0; i < count; i++) {
        const byte = cursor.readUint8OrThrow()
        value = (value * 256) + byte
        values.push(byte)
      }

      return new Long(value, values)
    }

    export class Short {

      constructor(
        readonly value: number
      ) { }

      toASN1() {
        return new Length(this.value)
      }

      sizeOrThrow() {
        return 1
      }

      writeOrThrow(cursor: Cursor) {
        cursor.writeUint8OrThrow(this.value)
      }

    }

    export class Long {

      constructor(
        readonly value: number,
        readonly values: Array<number>
      ) { }

      toASN1() {
        return new Length(this.value)
      }

      sizeOrThrow() {
        return 1 + this.values.length
      }

      writeOrThrow(cursor: Cursor) {
        const count = new Bitset(this.values.length, 8).enableBE(0).value

        cursor.writeUint8OrThrow(count)

        for (const byte of this.values)
          cursor.writeUint8OrThrow(byte)

        return
      }

    }

  }

}
