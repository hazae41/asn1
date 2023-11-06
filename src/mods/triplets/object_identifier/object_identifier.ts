import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result, Unimplemented } from "@hazae41/result";
import { Numbers } from "libs/numbers/numbers.js";
import { Length } from "mods/length/length.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";
import { VLQ } from "mods/variable_length_quantity/variable_length_quantity.js";

export class NotAnOID extends Error {
  readonly #class = NotAnOID
  readonly name = this.#class.name

  constructor(
    readonly text: string
  ) {
    super(`${text} is not an OID`)
  }

}

export class OID<T extends string> {

  private constructor(
    readonly inner: T
  ) { }

  static new<T extends string>(inner: T) {
    return new OID(inner)
  }

  static tryNew<T extends string>(inner: T): Result<OID<T>, NotAnOID> {
    if (!inner.split(".").every(x => Numbers.isSafeNonNegativeInteger(Number(x))))
      return new Err(new NotAnOID(inner))
    return new Ok(new OID<T>(inner))
  }

}

export class ObjectIdentifier<T extends string = string>  {
  readonly #class = ObjectIdentifier

  static type = Type.from(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OBJECT_IDENTIFIER)

  constructor(
    readonly type: Type,
    readonly value: OID<T>
  ) { }

  static create<T extends string>(value: OID<T>) {
    return new ObjectIdentifier(this.type, value)
  }

  get class() {
    return this.#class
  }

  toDER() {
    const values = new Array<VLQ.DER>()
    const texts = this.value.inner.split(".")

    const first = Number(texts[0])
    const second = Number(texts[1])
    const header = [first, second] as const

    let size = 1

    for (let i = 2; i < texts.length; i++) {
      const vlq = new VLQ(Number(texts[i])).toDER()
      size += vlq.trySize().get()
      values.push(vlq)
    }

    const type = this.type.toDER()
    const length = new Length(size).toDER()

    return new ObjectIdentifier.DER(type, length, header, values)
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
      return Triplet.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        const [first, second] = this.header

        cursor.tryWriteUint8((first * 40) + second).throw(t)

        for (const value of this.values)
          value.tryWrite(cursor).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<ObjectIdentifier, BinaryReadError | NotAnOID | Unimplemented> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const content = cursor.tryRead(length.value).throw(t)
        const subcursor = new Cursor(content)

        const header = subcursor.tryReadUint8().throw(t)
        const first = Math.floor(header / 40)
        const second = header % 40

        const values = [first, second]

        while (subcursor.remaining)
          values.push(VLQ.DER.tryRead(subcursor).throw(t).value)

        const value = values.join(".")

        const oid = OID.tryNew(value).throw(t)

        return new Ok(new ObjectIdentifier(type, oid))
      })
    }
  }

}