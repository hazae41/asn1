import { Err, Ok, Result } from "@hazae41/result"
import { Class } from "libs/reflection/reflection.js"
import { Triplet } from "mods/triplets/triplet.js"
import { Type } from "mods/type/type.js"
import { ASN1CastError, ASN1OverflowError } from "./errors.js"
import { ASN1Resolvable } from "./resolvable.js"

export interface ANS1Holder {
  readonly triplets: Triplet[]
}

export class ASN1Cursor<T extends ANS1Holder> {

  offset = 0

  constructor(
    readonly inner: T
  ) { }

  static new<T extends ANS1Holder>(inner: T) {
    return new this(inner)
  }

  static tryCastAndFrom<T extends ANS1Holder>(holder: Triplet, clazz: Class<T>, type?: Type): Result<ASN1Cursor<T>, ASN1CastError> {
    if (holder instanceof clazz)
      if (type === undefined || holder.type.equals(type))
        return new Ok(new this(holder))

    return new Err(new ASN1CastError(holder, [clazz]))
  }

  get before() {
    return this.inner.triplets.slice(0, this.offset)
  }

  get after() {
    return this.inner.triplets.slice(this.offset)
  }

  tryGet(): Result<Triplet, ASN1OverflowError> {
    const triplet = this.inner.triplets.at(this.offset)

    if (triplet === undefined)
      return new Err(new ASN1OverflowError())

    return new Ok(triplet)
  }

  tryRead(): Result<Triplet, ASN1OverflowError> {
    return this.tryGet().inspectSync(() => this.offset++)
  }

  tryReadAndResolve<T extends ASN1Resolvable.Infer<T>>(readable: T): Result<ASN1Resolvable.ResolveOutput<T>, ASN1Resolvable.ResolveError<T> | ASN1OverflowError> {
    return this.tryRead().andThenSync(triplet => readable.tryResolve(triplet))
  }

  tryReadAndCast<T>(...clazzes: Class<T>[]): Result<T, ASN1OverflowError | ASN1CastError> {
    const triplet = this.tryRead()

    if (triplet.isErr())
      return triplet

    for (const clazz of clazzes)
      if (triplet.inner instanceof clazz)
        return triplet as Ok<T>

    return new Err(new ASN1CastError(triplet.get(), clazzes))
  }

}
