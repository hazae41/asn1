import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
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

  static newWithoutCheck<T extends string>(inner: T) {
    return new OID(inner)
  }

  static newOrThrow<T extends string>(inner: T) {
    if (!inner.split(".").every(x => Numbers.isSafeNonNegativeInteger(Number(x))))
      throw new NotAnOID(inner)

    return new OID<T>(inner)
  }

  static tryNew<T extends string>(inner: T): Result<OID<T>, NotAnOID> {
    if (!inner.split(".").every(x => Numbers.isSafeNonNegativeInteger(Number(x))))
      return new Err(new NotAnOID(inner))

    return new Ok(new OID<T>(inner))
  }

}

export class ObjectIdentifier<T extends string = string>  {

  static readonly type = Type.create(
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

  toDER() {
    return ObjectIdentifier.DER.from(this)
  }

  toString() {
    return `OBJECT IDENTIFIER ${this.value}`
  }

}

export namespace ObjectIdentifier {

  export class DER<T extends string = string> extends ObjectIdentifier {

    static readonly type = ObjectIdentifier.type.toDER()

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly value: OID<T>,
      readonly header: readonly [number, number],
      readonly values: readonly VLQ.DER[]
    ) {
      super(type, value)
    }

    static from(asn1: ObjectIdentifier) {
      const values = new Array<VLQ.DER>()
      const texts = asn1.value.inner.split(".")

      const first = Number(texts[0])
      const second = Number(texts[1])
      const header = [first, second] as const

      let size = 1

      for (let i = 2; i < texts.length; i++) {
        const vlq = new VLQ(Number(texts[i])).toDER()
        size += vlq.sizeOrThrow()
        values.push(vlq)
      }

      const length = new Length(size).toDER()

      return new DER(asn1.type.toDER(), length, asn1.value, header, values)
    }

    sizeOrThrow() {
      return Triplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      const [first, second] = this.header

      cursor.writeUint8OrThrow((first * 40) + second)

      for (const value of this.values)
        value.writeOrThrow(cursor)

      return
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      const content = cursor.readOrThrow(length.value)
      const subcursor = new Cursor(content)

      const header = subcursor.readUint8OrThrow()
      const first = Math.floor(header / 40)
      const second = header % 40

      const values = [first, second]

      while (subcursor.remaining)
        values.push(VLQ.DER.readOrThrow(subcursor).value)

      const value = values.join(".")
      const oid = OID.newOrThrow(value)

      return new ObjectIdentifier(type, oid)
    }
  }

}