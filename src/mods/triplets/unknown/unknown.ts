import { Binary } from "libs/binary/binary.js";
import { Length } from "mods/length/length.js";
import { Type } from "mods/type/type.js";

export class Unknown {
  readonly class = Unknown

  constructor(
    readonly type: Type,
    readonly length: Length
  ) { }

  toString() {
    return `UNKNOWN`
  }

  static fromDER(binary: Binary) {
    const type = Type.fromDER(binary)

    // NO-OP

    const length = Length.fromDER(binary)

    const content = binary.offset

    binary.offset += length.value

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(type, length)
  }
}