import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";

export class Length {
  readonly #class = Length

  constructor(
    readonly value: number
  ) { }

  get class() {
    return this.#class
  }

  toDER() {
    return new Length.DER(this)
  }

}

export namespace Length {

  export class DER {
    static inner = Length

    constructor(
      readonly inner: Length
    ) { }

    #data?: {
      values: Array<number>
    }

    tryPrepare(): Result<DER, Error> {
      if (this.inner.value < 128)
        return new Ok(this)

      let value = this.inner.value

      const values = new Array<number>()

      do {
        values.push(value % 256)
        value = Math.floor(value / 256)
      } while (value)

      values.reverse()

      this.#data = { values }
      return new Ok(this)
    }

    trySize(): Result<number, Error> {
      if (this.inner.value < 128)
        return new Ok(1)

      if (!this.#data)
        return Err.error(`Unprepared ${this.inner.class.name}`)

      const { values } = this.#data

      return new Ok(1 + values.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      if (this.inner.value < 128)
        return cursor.tryWriteUint8(this.inner.value)

      if (!this.#data)
        return Err.error(`Unprepared ${this.inner.class.name}`)

      const { values } = this.#data

      const count = new Bitset(values.length, 8)
        .enableBE(0)
        .value

      try {
        cursor.tryWriteUint8(count).throw()

        for (const value of values)
          cursor.tryWriteUint8(value).throw()

        return Ok.void()
      } catch (e: unknown) {
        return Err.catch(e, Error)
      }
    }

    static tryRead(cursor: Cursor): Result<Length, Error> {
      try {
        const first = cursor.tryReadUint8().throw()

        if (first < 128)
          return new Ok(new this.inner(first))

        const count = new Bitset(first, 8)
          .disableBE(0)
          .value

        let value = 0

        for (let i = 0; i < count; i++)
          value = (value * 256) + cursor.tryReadUint8().throw()

        return new Ok(new this.inner(value))
      } catch (e: unknown) {
        return Err.catch(e, Error)
      }
    }
  }

}
