import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result, Unimplemented } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Resolvable } from "mods/resolvers/resolvable.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { DERWritable, Triplet } from "mods/triplets/triplet.js";
import { Type } from "mods/type/type.js";

const stringify = (set: Set) => `SET {
  ${set.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Set<T extends readonly Triplet[] = readonly Triplet[]> {
  readonly #class = Set

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SET)

  constructor(
    readonly type: Type,
    readonly triplets: T
  ) { }

  static create<T extends readonly Triplet[]>(triplets: T): Set<T> {
    return new Set(this.type, triplets)
  }

  static tryResolve<ResolveError>(sequence: Set<Opaque[]>, resolvable: Resolvable<ResolveError>): Result<Set<Triplet[]>, ResolveError> {
    return Result.unthrowSync(t => {
      const resolveds = sequence.triplets.map(it => resolvable.tryResolve(it).throw(t))

      return new Ok(new Set(sequence.type, resolveds))
    })
  }

  get class() {
    return this.#class
  }

  toDER() {
    const triplets = this.triplets.map(it => it.toDER())
    const size = triplets.reduce((p, c) => p + c.trySize().get(), 0)

    const type = this.type.toDER()
    const length = new Length(size).toDER()

    return new Set.DER(type, length, triplets)
  }

  toString(): string {
    return stringify(this)
  }
}

export class SetWriteUnknownError extends Error {
  readonly #class = SetWriteUnknownError

  static new(cause: unknown) {
    return new SetWriteUnknownError(undefined, { cause })
  }
}

export namespace Set {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly triplets: DERWritable[]
    ) { }

    trySize(): Result<number, never> {
      return Triplet.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
      return Result.unthrowSync(t => {
        this.type.tryWrite(cursor).throw(t)
        this.length.tryWrite(cursor).throw(t)

        for (const triplet of this.triplets)
          triplet.tryWrite(cursor).throw(t)

        return Ok.void()
      })
    }

    static tryRead(cursor: Cursor): Result<Set<Opaque[]>, BinaryReadError | Unimplemented> {
      return Result.unthrowSync(t => {
        const type = Type.DER.tryRead(cursor).throw(t)
        const length = Length.DER.tryRead(cursor).throw(t)

        const content = cursor.tryRead(length.value).throw(t)
        const subcursor = new Cursor(content)

        const triplets = new Array<Opaque>()

        while (subcursor.remaining)
          triplets.push(Opaque.DER.tryRead(subcursor).throw(t))

        return new Ok(new Set(type, triplets))
      })
    }
  }
}