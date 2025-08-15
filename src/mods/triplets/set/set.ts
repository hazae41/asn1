import { Cursor } from "@hazae41/cursor";
import { DERable } from "index.js";
import { Nullable } from "libs/nullable/index.js";
import { Length } from "mods/length/length.js";
import { DERTriplet } from "mods/resolvers/der/triplet.js";
import { Triplet } from "mods/resolvers/triplet.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Type } from "mods/type/type.js";

const stringify = (set: Set) => `SET {
  ${set.triplets.map(it => it?.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export namespace Set {
  export type Inner = Nullable<Triplet>
}

export class Set<T extends readonly Set.Inner[] = readonly Set.Inner[]> {

  static readonly type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SET)

  constructor(
    readonly type: Type,
    readonly triplets: T
  ) { }

  static create<T extends readonly Set.Inner[]>(type = this.type, triplets: T): Set<T> {
    return new Set(type, triplets)
  }

  toDER() {
    return Set.DER.from(this)
  }

  toString(): string {
    return stringify(this)
  }

}

export namespace Set {

  export namespace DER {
    export type Inner = Nullable<DERTriplet>
  }

  export class DER<T extends readonly DER.Inner[] = readonly DER.Inner[]> extends Set<T> {

    static readonly type = Set.type.toDER()

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly triplets: T
    ) {
      super(type, triplets)
    }

    static from<T extends readonly Set.Inner[] = readonly Set.Inner[]>(asn1: Set<T>) {
      const triplets = asn1.triplets.map(it => it?.toDER()) as DERable.AllFromOrSelf<T>
      const size = triplets.reduce((p, c) => p + (c == null ? 0 : c.sizeOrThrow()), 0)
      const length = new Length(size).toDER()

      return new DER(asn1.type.toDER(), length, triplets)
    }

    resolveOrThrow(this: DER<Opaque.DER[]>) {
      const resolved = this.triplets.map(it => it.resolveOrThrow())

      return new DER(this.type, this.length, resolved)
    }

    sizeOrThrow() {
      return DERTriplet.sizeOrThrow(this.length)
    }

    writeOrThrow(cursor: Cursor) {
      this.type.writeOrThrow(cursor)
      this.length.writeOrThrow(cursor)

      for (const triplet of this.triplets)
        triplet?.writeOrThrow(cursor)

      return
    }

    static readOrThrow(cursor: Cursor) {
      const type = Type.DER.readOrThrow(cursor)
      const length = Length.DER.readOrThrow(cursor)

      const subcursor = new Cursor(cursor.readOrThrow(length.value))

      const triplets = new Array<Opaque.DER>()

      while (subcursor.remaining)
        triplets.push(Opaque.DER.readOrThrow(subcursor))

      return new DER(type, length, triplets)
    }

  }
}