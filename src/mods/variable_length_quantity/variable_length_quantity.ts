import { Arrays } from "@hazae41/arrays";
import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";

export class VLQ {
  readonly #class = VLQ

  constructor(
    readonly value: number
  ) { }

  get class() {
    return this.#class
  }

  tryToDER(): Result<VLQ.DER, never> {
    let value = this.value

    const values = new Array<number>()

    do {
      values.push(value % 128)
      value = Math.floor(value / 128)
    } while (value)

    values.reverse()

    return new Ok(new VLQ.DER(values))
  }

}

export namespace VLQ {

  export class DER {

    constructor(
      readonly values: Array<number>
    ) { }

    trySize(): Result<number, Error> {
      return new Ok(this.values.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        for (let i = 0; i < this.values.length - 1; i++) {
          const bitset = new Bitset(this.values[i], 8)
          cursor.tryWriteUint8(bitset.enableBE(0).value).throw()
        }

        cursor.tryWriteUint8(Arrays.last(this.values)).throw()

        return Ok.void()
      }, Error)
    }

    static tryRead(cursor: Cursor): Result<VLQ, Error> {
      return Result.unthrowSync(() => {
        const values = new Array<number>()

        while (true) {
          const current = cursor.tryReadUint8().throw()

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

        return new Ok(new VLQ(value))
      }, Error)
    }

  }

}