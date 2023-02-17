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
    readonly value: string
  ) { }

  get type() {
    return this.#class.type
  }

  #data?: {
    length: Length
    header: readonly [number, number]
    values: Array<VLQ>
  }

  prepare() {
    const values = new Array<VLQ>()
    const texts = this.value.split(".")

    const first = Number(texts[0])
    const second = Number(texts[1])
    const header = [first, second] as const

    let size = 1

    for (let i = 2; i < texts.length; i++) {
      const vlq = new VLQ(Number(texts[i]))
      size += vlq.size()
      values.push(vlq)
    }

    const length = new Length(size)
    return this.#data = { length, header, values }
  }

  size() {
    const { length } = this.prepare()
    return Triplets.size(length)
  }

  write(cursor: Cursor) {
    if (!this.#data)
      throw new Error(`Unprepared`)
    const { length, header, values } = this.#data

    this.type.write(cursor)
    length.write(cursor)

    const content = cursor.offset

    const [first, second] = header
    cursor.writeUint8((first * 40) + second)

    for (const value of values)
      value.write(cursor)

    if (cursor.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return
  }

  static read(cursor: Cursor) {
    const type = Type.read(cursor)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.read(cursor)

    return this.readl(cursor, length.value)
  }

  static readl(cursor: Cursor, length: number) {
    const start = cursor.offset

    const header = cursor.readUint8()
    const first = Math.floor(header / 40)
    const second = header % 40

    const values = [first, second]

    while (cursor.offset - start < length)
      values.push(VLQ.read(cursor).value)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid length`)

    return new this(values.join("."))
  }

  toString() {
    return `OBJECT IDENTIFIER ${this.value}`
  }
}