import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
import { Numbers } from "libs/numbers/numbers.js";
import { Length } from "mods/length/length.js";
import { DERTriplet } from "mods/resolvers/der/triplet.js";
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

  static create<T extends string>(type = this.type, value: OID<T>) {
    return new ObjectIdentifier(type, value)
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
      readonly head: readonly number[],
      readonly body: readonly VLQ.DER[]
    ) {
      super(type, value)
    }

    static from(asn1: ObjectIdentifier) {
      const texts = asn1.value.inner.split(".")

      const first = Number(texts[0])
      const second = Number(texts[1])
      const head = [first, second]

      let size = 1

      const body = new Array<VLQ.DER>()

      for (let i = 2; i < texts.length; i++) {
        const vlq = new VLQ(Number(texts[i])).toDER()
        size += vlq.sizeOrThrow()
        body.push(vlq)
      }

      const length = new Length(size).toDER()

      return new DER(asn1.type.toDER(), length, asn1.value, head, body)
    }

    sizeOrThrow() {
      return DERTriplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      const [first, second] = this.head
      cursor.writeUint8OrThrow((first * 40) + second)

      for (const vlq of this.body)
        vlq.writeOrThrow(cursor)

      return
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      const content = cursor.readOrThrow(length.value)
      const subcursor = new Cursor(content)

      const byte = subcursor.readUint8OrThrow()
      const first = Math.floor(byte / 40)
      const second = byte % 40

      const head = [first, second]
      const body = new Array<VLQ.DER>()

      const all = [first, second]

      while (subcursor.remaining) {
        const vlq = VLQ.DER.readOrThrow(subcursor)
        body.push(vlq)
        all.push(vlq.value)
      }

      const value = all.join(".")
      const oid = OID.newOrThrow(value)

      return new DER(type, length, oid, head, body)
    }
  }

}