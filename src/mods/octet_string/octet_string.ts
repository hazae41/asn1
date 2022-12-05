import { Binary } from "libs/binary/binary.js"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export class OctetString {
  readonly class = OctetString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.OCTET_STRING)

  constructor(
    readonly buffer: Buffer
  ) { }

  get type() {
    return this.class.type
  }

  toString() {
    return `OCTET STRING ${this.buffer.toString("hex")}`
  }

  toDER(binary: Binary) {
    this.type.toDER(binary)

    const length = new Length(this.buffer.length)

    length.toDER(binary)

    const content = binary.offset

    binary.write(this.buffer)

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

    const buffer = binary.read(length.value)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(buffer)
  }
}