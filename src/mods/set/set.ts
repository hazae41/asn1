import { Binary } from "libs/binary/binary.js";
import { Length } from "mods/length/length.js";
import { Type } from "mods/type/type.js";
import { ToStringable } from "mods/types.js";

const stringify = (set: Set) => `SET {
  ${set.inner.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Set {
  readonly class = Set

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SET)

  constructor(
    readonly inner: ToStringable[]
  ) { }

  get type() {
    return this.class.type
  }

  toString() {
    return stringify(this)
  }

  static fromDER(binary: Binary, parse: (binary: Binary) => ToStringable) {
    const type = Type.fromDER(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.fromDER(binary)

    const content = binary.offset

    const inner = new Array()

    while (binary.offset - content < length.value)
      inner.push(parse(binary))

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(inner)
  }
}