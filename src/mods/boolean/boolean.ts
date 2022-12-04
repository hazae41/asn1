import { Binary } from "libs/binary/binary.js"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export class Boolean {
  readonly class = Boolean

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BOOLEAN)

  constructor(
    readonly value: number
  ) { }

  get type() {
    return this.class.type
  }

  toString() {
    return `BOOLEAN ${this.value !== 0}`
  }

  toDER(binary: Binary) {
    this.type.toDER(binary)
    new Length(1).toDER(binary)
    binary.writeUint8(this.value)
  }

  static fromDER(binary: Binary) {
    const type = Type.fromDER(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.fromDER(binary)
    const content = binary.offset

    const value = binary.readUint8()

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(value)
  }
}