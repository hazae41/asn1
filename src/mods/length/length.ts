import { Binary } from "libs/binary/binary.js";
import { Bitset } from "libs/bitset/bitset.js";

export class Length {
  readonly class = Length

  constructor(
    readonly value: number
  ) { }

  size() {
    if (this.value < 128)
      return 1

    // TODO

    return 1
  }

  write(binary: Binary) {
    if (this.value < 128)
      return binary.writeUint8(this.value)

    // TODO

    binary.writeUint8(127)

    return
  }

  static read(binary: Binary) {
    const first = binary.readUint8()

    if (first < 128)
      return new this(first)

    const count = new Bitset(first, 8)
      .disable(7)
      .value

    let value = 0

    for (let i = 0; i < count; i++)
      value += binary.readUint8() * (256 ** (count - i - 1))

    return new this(value)
  }
}