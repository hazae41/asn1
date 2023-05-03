import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";

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

    #data?: {
      values: Array<number>
    }

    tryPrepare(): Result<DER, never> {
      let value = this.inner.value

      const values = new Array<number>()

      do {
        values.push(value % 128)
        value = Math.floor(value / 128)
      } while (value)

      values.reverse()
      this.#data = { values }
      return new Ok(this)
    }

    trySize(): Result<number, Error> {
      if (!this.#data)
        return Err.error(`Unprepared ${this.inner.class.name}`)

      const { values } = this.#data

      return new Ok(values.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        if (!this.#data)
          return Err.error(`Unprepared ${this.inner.class.name}`)

        const { values } = this.#data

        for (let i = 0; i < values.length - 1; i++) {
          const bitset = new Bitset(values[i], 8)
          cursor.tryWriteUint8(bitset.enableBE(0).value).throw()
        }

        cursor.tryWriteUint8(values[values.length - 1]).throw()

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

        return new Ok(new this.inner(value))
      }, Error)
    }

  }

}