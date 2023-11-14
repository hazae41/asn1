import { Class } from "libs/reflection/reflection.js"
import { DERTriplet } from "mods/resolvers/der/triplet.js"
import { Type } from "mods/type/type.js"

export interface DERHolder extends DERTriplet {
  readonly triplets: DERTriplet[]
}

export class DERCursor {

  offset = 0

  constructor(
    readonly triplets: DERTriplet[]
  ) { }

  get before() {
    return this.triplets.slice(0, this.offset)
  }

  get after() {
    return this.triplets.slice(this.offset)
  }

  get() {
    return this.triplets.at(this.offset)
  }

  getOrThrow() {
    const triplet = this.get()

    if (triplet == null)
      throw new DERCursor.ReadError()

    return triplet
  }

  getAs<T extends DERTriplet>(...clazzes: Class<T>[]): T | undefined {
    const triplet = this.get()

    if (triplet == null)
      return undefined

    for (const clazz of clazzes)
      if (triplet instanceof clazz)
        return triplet as T

    return undefined
  }

  getAsType<T extends DERTriplet>(type: Type.DER, ...clazzes: Class<T>[]): T | undefined {
    const triplet = this.get()

    if (triplet == null)
      return undefined

    if (!triplet.type.equals(type))
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

  readAs<T extends DERTriplet>(...clazzes: Class<T>[]): T | undefined {
    const triplet = this.getAs(...clazzes)

    if (triplet != null)
      this.offset++

    return triplet
  }

  readAsType<T extends DERTriplet>(type: Type.DER, ...clazzes: Class<T>[]): T | undefined {
    const triplet = this.getAsType(type, ...clazzes)

    if (triplet != null)
      this.offset++

    return triplet
  }

  readOrThrow() {
    const triplet = this.read()

    if (triplet == null)
      throw new DERCursor.ReadError()

    return triplet
  }

  readAsOrThrow<T extends DERTriplet>(...clazzes: Class<T>[]): T {
    const triplet = this.readAs(...clazzes)

    if (triplet == null)
      throw new DERCursor.ReadError()

    return triplet
  }

  readAsTypeOrThrow<T extends DERTriplet>(type: Type.DER, ...clazzes: Class<T>[]): T {
    const triplet = this.readAsType(type, ...clazzes)

    if (triplet == null)
      throw new DERCursor.ReadError()

    return triplet
  }

  subAs<T extends DERHolder>(clazz: Class<T>): DERCursor | undefined {
    const triplet = this.readAs(clazz)

    if (triplet == null)
      return undefined

    return new DERCursor(triplet.triplets)
  }

  subAsType<T extends DERHolder>(type: Type.DER, clazz: Class<T>): DERCursor | undefined {
    const triplet = this.readAsType(type, clazz)

    if (triplet == null)
      return undefined

    return new DERCursor(triplet.triplets)
  }

  subAsOrThrow<T extends DERHolder>(clazz: Class<T>): DERCursor {
    return new DERCursor(this.readAsOrThrow(clazz).triplets)
  }

  subAsTypeOrThrow<T extends DERHolder>(type: Type.DER, clazz: Class<T>): DERCursor {
    return new DERCursor(this.readAsTypeOrThrow(type, clazz).triplets)
  }

}

export namespace DERCursor {

  export type AnyError =
    | CastError
    | ReadError

  export class CastError extends Error {
    readonly #class = CastError
    readonly name = this.#class.name

    constructor() {
      super(`Could not cast triplet`)
    }

  }

  export class ReadError extends Error {
    readonly #class = ReadError
    readonly name = this.#class.name

    constructor() {
      super(`Could not read triplet`)
    }

  }

}