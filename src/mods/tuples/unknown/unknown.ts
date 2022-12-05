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
    const length = Length.fromDER(binary)

    binary.offset += length.value

    return new this(type, length)
  }
}