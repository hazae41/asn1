import { Err, Ok, Result } from "@hazae41/result"
import { Class } from "libs/reflection/reflection.js"
import { DERTriplet } from "mods/resolvers/der/triplet.js"
import { Triplet } from "mods/resolvers/triplet.js"
import { Type } from "mods/type/type.js"
import { CastError, ReadError } from "./errors.js"

export interface DERHolder {
  readonly triplets: DERTriplet[]
}

export class DERCursor<T extends DERHolder> {

  offset = 0

  constructor(
    readonly inner: T
  ) { }

  static new<T extends DERHolder>(inner: T) {
    return new DERCursor(inner)
  }

  static fromAsOrThrow<T extends DERHolder>(holder: DERTriplet, clazz: Class<T>, type?: Type.DER): DERCursor<T> {
    if (holder instanceof clazz)
      if (type == null || holder.type.equals(type))
        return new DERCursor(holder)

    throw new CastError()
  }

  static tryFromAs<T extends DERHolder>(holder: DERTriplet, clazz: Class<T>, type?: Type.DER): Result<DERCursor<T>, CastError> {
    if (holder instanceof clazz)
      if (type == null || holder.type.equals(type))
        return new Ok(new DERCursor(holder))

    return new Err(new CastError())
  }

  get before() {
    return this.inner.triplets.slice(0, this.offset)
  }

  get after() {
    return this.inner.triplets.slice(this.offset)
  }

  getOrThrow() {
    const triplet = this.inner.triplets.at(this.offset)

    if (triplet === undefined)
      throw new ReadError()

    return triplet
  }

  tryGet(): Result<Triplet, ReadError> {
    const triplet = this.inner.triplets.at(this.offset)

    if (triplet === undefined)
      return new Err(new ReadError())

    return new Ok(triplet)
  }

  readOrThrow() {
    const triplet = this.getOrThrow()
    this.offset++
    return triplet
  }

  tryRead(): Result<Triplet, ReadError> {
    return this.tryGet().inspectSync(() => this.offset++)
  }

  readAsOrThrow<T>(...clazzes: Class<T>[]): T {
    const triplet = this.readOrThrow()

    for (const clazz of clazzes)
      if (triplet instanceof clazz)
        return triplet as T

    throw new CastError()
  }

  tryReadAs<T>(...clazzes: Class<T>[]): Result<T, ReadError | CastError> {
    return Result.unthrowSync(t => {
      const triplet = this.tryRead().throw(t)

      for (const clazz of clazzes)
        if (triplet instanceof clazz)
          return new Ok(triplet)

      return new Err(new CastError())
    })
  }

}
