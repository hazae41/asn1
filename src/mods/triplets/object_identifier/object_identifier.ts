import { Cursor } from "@hazae41/binary";
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

  toDER() {
    return new ObjectIdentifier.DER(this)
  }

  toString() {
    return `OBJECT IDENTIFIER ${this.value}`
  }

}

export namespace ObjectIdentifier {

  export class DER {
    static inner = ObjectIdentifier

    constructor(
      readonly inner: ObjectIdentifier
    ) { }

    #data?: {
      length: Length.LengthDER
      header: readonly [number, number]
      values: VLQ.DER[]
    }

    prepare() {
      const values = new Array<VLQ.DER>()
      const texts = this.inner.value.split(".")

      const first = Number(texts[0])
      const second = Number(texts[1])
      const header = [first, second] as const

      let size = 1

      for (let i = 2; i < texts.length; i++) {
        const vlq = new VLQ(Number(texts[i])).toDER().prepare()
        size += vlq.size()
        values.push(vlq)
      }

      const length = new Length(size).toDER().prepare()

      this.#data = { length, header, values }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { length } = this.#data

      return Triplets.trySize(length)
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.inner.class.name}`)
      const { length, header, values } = this.#data

      this.inner.type.toDER().write(cursor)
      length.write(cursor)

      const [first, second] = header
      cursor.writeUint8((first * 40) + second)

      for (const value of values)
        value.write(cursor)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.LengthDER.read(cursor)

      const content = cursor.read(length.value)
      const subcursor = new Cursor(content)

      const header = subcursor.readUint8()
      const first = Math.floor(header / 40)
      const second = header % 40

      const values = [first, second]

      while (subcursor.remaining)
        values.push(VLQ.DER.read(subcursor).value)

      const value = values.join(".")

      return new this.inner(type, value)
    }
  }

}