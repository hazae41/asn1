import { Cursor, Writable } from "@hazae41/binary";
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

  #data?: {
    length: Length
    header: readonly [number, number]
    values: Writable[]
  }

  prepare() {
    const values = new Array<VLQ>()
    const texts = this.value.split(".")

    const first = Number(texts[0])
    const second = Number(texts[1])
    const header = [first, second] as const

    let size = 1

    for (let i = 2; i < texts.length; i++) {
      const vlq = new VLQ(Number(texts[i])).prepare()
      size += vlq.size()
      values.push(vlq)
    }

    const length = new Length(size).prepare()

    this.#data = { length, header, values }
    return this
  }

  size() {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)
    const { length } = this.#data

    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared ${this.#class.name}`)
    const { length, header, values } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    const [first, second] = header
    cursor.writeUint8((first * 40) + second)

    for (const value of values)
      value.write(cursor)
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)
    const length = Length.read(cursor)

    const subcursor = new Cursor(cursor.read(length.value))

    const header = subcursor.readUint8()
    const first = Math.floor(header / 40)
    const second = header % 40

    const values = [first, second]

    while (subcursor.remaining)
      values.push(VLQ.read(subcursor).value)

    const value = values.join(".")

    return new this(type, value)
  }

  toString() {
    return `OBJECT IDENTIFIER ${this.value}`
  }

}