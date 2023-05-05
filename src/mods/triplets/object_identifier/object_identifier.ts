import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
import { Numbers } from "libs/numbers/numbers.js";
import { Length } from "mods/length/length.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";
import { VLQ } from "mods/variable_length_quantity/variable_length_quantity.js";

export class NotAnOID extends Error {
  readonly #class = NotAnOID

  constructor(
    readonly text: string
  ) {
    super(`Could not convert ${text} to OID`)
  }

}

export class OID<T extends string> {

  private constructor(
    readonly inner: T
  ) { }

  static tryNew<T extends string>(inner: T): Result<OID<T>, NotAnOID> {
    if (inner.split(".").every(x => Numbers.isSafeNonNegativeInteger(Number(x))))
      return new Ok(new OID(inner))
    return new Err(new NotAnOID(inner))
  }

}

export class ObjectIdentifier<T extends string = string>  {
  readonly #class = ObjectIdentifier

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OBJECT_IDENTIFIER)

  constructor(
    readonly type: Type,
    readonly value: OID<T>
  ) { }

  static tryCreate<T extends string>(value: T): Result<ObjectIdentifier<T>, NotAnOID> {
    return OID.tryNew(value).mapSync(oid => new ObjectIdentifier(this.type, oid))
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<ObjectIdentifier.DER, Error> {
    return Result.unthrowSync(() => {
      const values = new Array<VLQ.DER>()
      const texts = this.value.inner.split(".")

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

        const oid = OID.tryNew(value).throw()

        return new Ok(new ObjectIdentifier(type, oid))
      }, Error)
    }
  }

}