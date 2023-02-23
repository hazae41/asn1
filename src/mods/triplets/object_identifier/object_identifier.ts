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

  readonly DER = new ObjectIdentifier.DER(this)

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

  toString() {
    return `OBJECT IDENTIFIER ${this.value}`
  }

}

export namespace ObjectIdentifier {

  export class DER {
    static parent = ObjectIdentifier

    constructor(
      readonly parent: ObjectIdentifier
    ) { }

    #data?: {
      length: Length
      header: readonly [number, number]
      values: VLQ[]
    }

    prepare() {
      const values = new Array<VLQ>()
      const texts = this.parent.value.split(".")

      const first = Number(texts[0])
      const second = Number(texts[1])
      const header = [first, second] as const

      let size = 1

      for (let i = 2; i < texts.length; i++) {
        const vlq = new VLQ(Number(texts[i])).DER.prepare().parent
        size += vlq.DER.size()
        values.push(vlq)
      }

      const length = new Length(size).DER.prepare().parent

      this.#data = { length, header, values }
      return this
    }

    size() {
      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { length } = this.#data

      return Triplets.size(length)
    }

    write(cursor: Cursor) {
      if (!this.#data)
        throw new Error(`Unprepared ${this.parent.class.name}`)
      const { length, header, values } = this.#data

      this.parent.type.DER.write(cursor)
      length.DER.write(cursor)

      const [first, second] = header
      cursor.writeUint8((first * 40) + second)

      for (const value of values)
        value.DER.write(cursor)
    }

    static read(cursor: Cursor) {
      const type = Type.DER.read(cursor)
      const length = Length.DER.read(cursor)

      const subcursor = new Cursor(cursor.read(length.value))

      const header = subcursor.readUint8()
      const first = Math.floor(header / 40)
      const second = header % 40

      const values = [first, second]

      while (subcursor.remaining)
        values.push(VLQ.DER.read(subcursor).value)

      const value = values.join(".")

      return new this.parent(type, value)
    }
  }

}