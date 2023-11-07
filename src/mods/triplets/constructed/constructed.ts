import { Cursor } from "@hazae41/cursor";
import { InvalidTypeError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { DERTriplet } from "mods/resolvers/der/triplet.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Constructed) => `[${parent.type.tag}] {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export namespace Constructed {
  export type Inner = Triplet
}

export class Constructed<T extends readonly Constructed.Inner[] = readonly Constructed.Inner[]> {

  constructor(
    readonly type: Type,
    readonly triplets: T
  ) { }

  static create<T extends readonly Triplet[]>(type: Type, triplets: T) {
    return new Constructed(type, triplets)
  }

  toDER() {
    return Constructed.DER.from(this)
  }

  toString(): string {
    return stringify(this)
  }

}

export namespace Constructed {

  export namespace DER {
    export type Inner = DERTriplet
  }

  export class DER<T extends readonly DER.Inner[] = readonly DER.Inner[]> extends Constructed<T> {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly triplets: T
    ) {
      super(type, triplets)
    }

    static from(asn1: Constructed) {
      const triplets = asn1.triplets.map(it => it.toDER())
      const size = triplets.reduce((p, c) => p + c.sizeOrThrow(), 0)
      const length = new Length(size).toDER()

      return new Constructed.DER(asn1.type.toDER(), length, triplets)
    }

    resolveOrThrow(this: DER<Opaque.DER[]>) {
      const resolved = this.triplets.map(it => it.resolveOrThrow())

      return new DER(this.type, this.length, resolved)
    }

    sizeOrThrow(): number {
      return DERTriplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      for (const triplet of this.triplets)
        triplet.writeOrThrow(cursor)

      return
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)

      if (type.wrap !== Type.wraps.CONSTRUCTED)
        throw new InvalidTypeError(`Constructed`, type.byte)

      const length = Length.DER.readOrThrow(cursor)

      const content = cursor.readOrThrow(length.value)
      const subcursor = new Cursor(content)

      const triplets = new Array<Opaque.DER>()

      while (subcursor.remaining)
        triplets.push(Opaque.DER.readOrThrow(subcursor))

      return new DER(type, length, triplets)
    }
  }

}