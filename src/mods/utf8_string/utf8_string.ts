import { Binary } from "libs/binary/binary.js"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export class UTF8String {
  readonly class = UTF8String

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.UTF8_STRING)

  constructor(
    readonly value: string
  ) { }

  get type() {
    return this.class.type
  }

  toString() {
    return `UTF8String ${this.value}`
  }

  toDER(binary: Binary) {
    this.type.toDER(binary)
    const buffer = Buffer.from(this.value)
    new Length(buffer.length).toDER(binary)
    binary.write(buffer)
  }

  static fromDER(binary: Binary) {
    const type = Type.fromDER(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.fromDER(binary)
    const content = binary.offset

    const value = binary.readString(length.value)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(value)
  }
}