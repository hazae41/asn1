import { Binary } from "libs/binary/binary.js"
import { Length } from "mods/length/length.js"
import { Type } from "mods/type/type.js"

export class Null {
  readonly class = Null

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.NULL)

  constructor() { }

  get type() {
    return this.class.type
  }

  toString() {
    return `NULL`
  }

  toDER(binary: Binary) {
    this.type.toDER(binary)

    const length = new Length(0)

    length.toDER(binary)

    const content = binary.offset

    // * NO-OP *

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

    // * NO-OP *

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this()
  }
}