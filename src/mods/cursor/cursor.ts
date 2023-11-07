import { Class } from "libs/reflection/reflection.js"
import { DERTriplet } from "mods/resolvers/der/triplet.js"
import { Type } from "mods/type/type.js"
import { CastError, ReadError } from "./errors.js"

export interface DERHolder {
  readonly triplets: DERTriplet[]
}

export class DERCursor<T extends DERHolder = DERHolder> {

  offset = 0

  constructor(
    readonly inner: T
  ) { }

  static new<T extends DERHolder>(inner: T) {
    return new DERCursor(inner)
  }

  get before() {
    return this.inner.triplets.slice(0, this.offset)
  }

  get after() {
    return this.inner.triplets.slice(this.offset)
  }

  get() {
    return this.inner.triplets.at(this.offset)
  }

  getOrThrow() {
    const triplet = this.get()

    if (triplet == null)
      throw new ReadError()

    return triplet
  }

  getAs<T>(...clazzes: Class<T>[]): T | undefined {
    const triplet = this.get()

    if (triplet == null)
      return undefined

    for (const clazz of clazzes)
      if (triplet instanceof clazz)
        return triplet as T

    return undefined
  }

  read() {
    const triplet = this.get()

    if (triplet != null)
      this.offset++

    return triplet
  }

  readOrThrow() {
    const triplet = this.read()

    if (triplet == null)
      throw new ReadError()

    return triplet
  }

  readAs<T>(...clazzes: Class<T>[]): T | undefined {
    const triplet = this.read()

    if (triplet == null)
      return undefined

    for (const clazz of clazzes)
      if (triplet instanceof clazz)
        return triplet as T

    return undefined
  }

  readAsOrThrow<T>(...clazzes: Class<T>[]): T {
    const triplet = this.readOrThrow()

    for (const clazz of clazzes)
      if (triplet instanceof clazz)
        return triplet as T

    throw new CastError()
  }

  readAsTypeOrThrow<T>(type: Type.DER, ...clazzes: Class<T>[]): T {
    const triplet = this.readOrThrow()

    if (!triplet.type.equals(type))
      throw new CastError()

    for (const clazz of clazzes)
      if (triplet instanceof clazz)
        return triplet as T

    throw new CastError()
  }

  subAsOrThrow<T extends DERHolder>(clazz: Class<T>): DERCursor<T> {
    return new DERCursor(this.readAsOrThrow(clazz))
  }

  subAsTypeOrThrow<T extends DERHolder>(type: Type.DER, clazz: Class<T>): DERCursor<T> {
    return new DERCursor(this.readAsTypeOrThrow(type, clazz))
  }

}
