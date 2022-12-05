import { Binary } from "libs/binary/binary.js";
import { Length } from "mods/length/length.js";
import { Type } from "mods/type/type.js";

export class BitString {
  readonly class = BitString

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.PRIMITIVE,
    Type.tags.BIT_STRING)

  constructor(
    readonly padding: number,
    readonly buffer: Buffer
  ) { }

  get type() {
    return this.class.type
  }

  toString() {
    const bignum = BigInt("0x" + this.buffer.toString("hex"))
    const binary = bignum.toString(2).padStart(this.buffer.length * 8, "0")
    return `BITSTRING ${binary.slice(0, binary.length - this.padding)}`
  }

  toDER(binary: Binary) {
    this.type.toDER(binary)
    new Length(1 + this.buffer.length).toDER(binary)
    binary.writeUint8(this.padding)
    binary.write(this.buffer)
  }

  static fromDER(binary: Binary) {
    const type = Type.fromDER(binary)

    if (!this.type.equals(type))
      throw new Error(`Invalid type`)

    const length = Length.fromDER(binary)
    const content = binary.offset

    const padding = binary.readUint8()
    const buffer = binary.read(length.value - 1)

    if (binary.offset - content !== length.value)
      throw new Error(`Invalid length`)

    return new this(padding, buffer)
  }
}