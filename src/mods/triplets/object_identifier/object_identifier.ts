import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";
import { VLQ } from "mods/variable_length_quantity/variable_length_quantity.js";

export class ObjectIdentifier {
  readonly #class = ObjectIdentifier

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OBJECT_IDENTIFIER)

  constructor(
    readonly type: Type,
    readonly value: string
  ) { }

  static new(value: string) {
    return new this(this.type, value)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<ObjectIdentifier.DER, Error> {
    return Result.unthrowSync(() => {
      const values = new Array<VLQ.DER>()
      const texts = this.value.split(".")

      const first = Number(texts[0])
      const second = Number(texts[1])
      const header = [first, second] as const

      let size = 1

      for (let i = 2; i < texts.length; i++) {
        const vlq = new VLQ(Number(texts[i])).tryToDER().throw()
        size += vlq.trySize().throw()
        values.push(vlq)
      }

      const type = this.type.tryToDER().inner
      const length = new Length(size).tryToDER().inner

      return new Ok(new ObjectIdentifier.DER(type, length, header, values))
    }, Error)
  }

  toString() {
    return `OBJECT IDENTIFIER ${this.value}`
  }

}

export namespace ObjectIdentifier {

  export class DER {
    static inner = ObjectIdentifier

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly header: readonly [number, number],
      readonly values: VLQ.DER[]
    ) { }

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        this.type.tryWrite(cursor).throw()
        this.length.tryWrite(cursor).throw()

        const [first, second] = this.header

        cursor.tryWriteUint8((first * 40) + second).throw()

        for (const value of this.values)
          value.tryWrite(cursor).throw()

        return Ok.void()
      }, Error)
    }

    static tryRead(cursor: Cursor): Result<ObjectIdentifier, Error> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        const content = cursor.tryRead(length.value).throw()
        const subcursor = new Cursor(content)

        const header = subcursor.tryReadUint8().throw()
        const first = Math.floor(header / 40)
        const second = header % 40

        const values = [first, second]

        while (subcursor.remaining)
          values.push(VLQ.DER.tryRead(subcursor).throw().value)

        const value = values.join(".")

        return new Ok(new ObjectIdentifier(type, value))
      }, Error)
    }
  }

}