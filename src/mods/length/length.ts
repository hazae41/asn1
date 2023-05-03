import { Bitset } from "@hazae41/bitset";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";

export class Length {
  readonly #class = Length

  constructor(
    readonly value: number
  ) { }

  static new(value: number) {
    return new Length(value)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<Length.DER, never> {
    if (this.value < 128)
      return new Ok(new Length.ShortDER(this.value))

    let floor = this.value

    const values = new Array<number>()

    do {
      values.push(floor % 256)
      floor = Math.floor(floor / 256)
    } while (floor)

    values.reverse()

    return new Ok(new Length.LongDER(this.value, values))
  }

}

export namespace Length {

  export type DER =
    | ShortDER
    | LongDER

  export namespace DER {

    export function tryRead(cursor: Cursor): Result<Length, Error> {
      return Result.unthrowSync(() => {
        const first = cursor.tryReadUint8().throw()

        if (first < 128)
          return new Ok(new Length(first))

        const count = new Bitset(first, 8)
          .disableBE(0)
          .value

        let value = 0

        for (let i = 0; i < count; i++)
          value = (value * 256) + cursor.tryReadUint8().throw()

        return new Ok(new Length(value))
      }, Error)
    }

  }

  export class ShortDER {

    constructor(
      readonly value: number
    ) { }

    trySize(): Result<number, never> {
      return new Ok(1)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return cursor.tryWriteUint8(this.value)
    }

  }

  export class LongDER {
    static inner = Length

    constructor(
      readonly value: number,
      readonly values: Array<number>
    ) { }

    trySize(): Result<number, never> {
      return new Ok(1 + this.values.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        const count = new Bitset(this.values.length, 8)
          .enableBE(0)
          .value

        cursor.tryWriteUint8(count).throw()

        for (const value of this.values)
          cursor.tryWriteUint8(value).throw()

        return Ok.void()
      }, Error)
    }

  }

}
