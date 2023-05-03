import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Err, Ok, Result } from "@hazae41/result";
import { InvalidTypeError } from "mods/errors/errors.js";
import { Length } from "mods/length/length.js";
import { Resolvable } from "mods/resolvers/resolvable.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Triplets } from "mods/triplets/triplets.js";
import { Type } from "mods/type/type.js";

const stringify = (parent: Constructed) => `[${parent.type.tag}] {
  ${parent.triplets.map(it => it.toString()).join(`\n`).replaceAll("\n", "\n" + "  ")}
}`

export class Constructed<T extends Triplet = Triplet> {
  readonly #class = Constructed

  constructor(
    readonly type: Type,
    readonly triplets: T[]
  ) { }

  static tryResolve(sequence: Constructed<Opaque>, resolvable: Resolvable): Result<Constructed<Triplet>, Error> {
    return Result.unthrowSync(() => {
      const resolveds = sequence.triplets.map(it => resolvable.tryResolve(it).throw())

      return new Ok(new Constructed(sequence.type, resolveds))
    }, Error)
  }

  get class() {
    return this.#class
  }

  tryToDER(): Result<Constructed.DER, Error> {
    return Result.unthrowSync(() => {
      const triplets = this.triplets.map(it => it.tryToDER().throw())
      const size = triplets.reduce((p, c) => p + c.trySize().throw(), 0)

      const type = this.type.tryToDER().inner
      const length = new Length(size).tryToDER().inner

      return new Ok(new Constructed.DER(type, length, triplets))
    }, Error)
  }

  toString(): string {
    return stringify(this)
  }

}

export namespace Constructed {

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

    static tryRead(cursor: Cursor): Result<Constructed<Opaque>, Error | InvalidTypeError> {
      return Result.unthrowSync(() => {
        const type = Type.DER.tryRead(cursor).throw()

        if (type.wrap !== Type.wraps.CONSTRUCTED)
          return new Err(new InvalidTypeError(`Constructed`, type))

        const length = Length.DER.tryRead(cursor).throw()

        const content = cursor.tryRead(length.value).throw()
        const subcursor = new Cursor(content)

        const triplets = new Array<Opaque>()

        while (subcursor.remaining)
          triplets.push(Opaque.DER.tryRead(subcursor).throw())

        return new Ok(new Constructed<Opaque>(type, triplets))
      }, Error)
    }
  }

}