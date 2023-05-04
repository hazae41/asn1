import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Resolvable } from "mods/resolvers/resolvable.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Sequence) => `SEQUENCE {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Sequence<T extends readonly Triplet[] = readonly Triplet[]> {
  readonly #class = Sequence

  static type = new Type(
    Type.clazzes.UNIVERSAL,
    Type.wraps.CONSTRUCTED,
    Type.tags.SEQUENCE)

  constructor(
    readonly type: Type,
    readonly triplets: T
  ) { }

  static new<T extends readonly Triplet[]>(triplets: T) {
    return new Sequence(this.type, triplets)
  }

  static tryResolve(sequence: Sequence<Opaque[]>, resolvable: Resolvable): Result<Sequence<Triplet[]>, Error> {
    return Result.unthrowSync(() => {
      const resolveds = sequence.triplets.map(it => resolvable.tryResolve(it).throw())

      return new Ok(new Sequence(sequence.type, resolveds))
    }, Error)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<Sequence.DER, Error> {
    return Result.unthrowSync(() => {
      const triplets = this.triplets.map(it => it.tryToDER().throw())
      const size = triplets.reduce((p, c) => p + c.trySize().throw(), 0)

      const type = this.type.tryToDER().inner
      const length = new Length(size).tryToDER().inner

      return new Ok(new Sequence.DER(type, length, triplets))
    }, Error)
  }

  toString(): string {
    return stringify(this)
  }

}

export namespace Sequence {

  export class DER {

    constructor(
      readonly type: Type.DER,
      readonly length: Length.DER,
      readonly triplets: Writable[]
    ) { }

    trySize(): Result<number, never> {
      return Triplets.trySize(this.length)
    }

    tryWrite(cursor: Cursor): Result<void, Error> {
      return Result.unthrowSync(() => {
        this.type.tryWrite(cursor).throw()
        this.length.tryWrite(cursor).throw()

        for (const triplet of this.triplets)
          triplet.tryWrite(cursor).throw()

        return Ok.void()
      }, Error)
    }

    static tryRead(cursor: Cursor): Result<Sequence<Opaque[]>, Error> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()
        const length = Length.DER.tryRead(cursor).throw()

        const content = cursor.tryRead(length.value).throw()
        const subcursor = new Cursor(content)

        const triplets = new Array<Opaque>()

        while (subcursor.remaining)
          triplets.push(Opaque.DER.tryRead(subcursor).throw())

        return new Ok(new Sequence(type, triplets))
      }, Error)
    }

  }
}