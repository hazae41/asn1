import { Binary } from "libs/binary/binary.js"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export class PrintableString {
  readonly class = PrintableString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.PRINTABLE_STRING)

  constructor(
    readonly value: string
  ) { }

  get type() {
    return this.class.type
  }

  toString() {
    return `PrintableString ${this.value}`
  }

  toDER(binary: Binary) {
    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(this.value))
      throw new Error(`Invalid value`)

    this.type.toDER(binary)

    const buffer = Buffer.from(this.value)

    const length = new Length(buffer.length)

    length.toDER(binary)

    const content = binary.offset

    binary.write(buffer)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return binary
  }

  static fromDER(binary: Binary) {
    const type = Type.fromDER(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.fromDER(binary)

    const content = binary.offset

    const value = binary.readString(length.value)

    if (!/^[a-zA-Z0-9'()+,\-.\/:=? ]+$/g.test(value))
      throw new Error(`Invalid value`)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(value)
  }
}