import { Readable } from "@hazae41/binary"
import { Nullable } from "@hazae41/option"
import { Class } from "libs/reflection/reflection.js"
import { DERTriplet } from "mods/resolvers/der/triplet.js"
import { Opaque } from "mods/triplets/opaque/opaque.js"
import { Type } from "mods/type/type.js"

export interface DERHolder extends DERTriplet {
  readonly triplets: DERTriplet[]
}

export type DERFactory<T extends DERTriplet> = Class<T> & Readable<T>

export interface DERResolvable<T> {
  readonly struct: DERFactory<DERHolder>
  resolveOrThrow(cursor: DERCursor): T
}

export class DERCursor {

  offset = 0

  constructor(
    readonly triplets: DERTriplet[]
  ) { }

  get remaining() {
    return this.triplets.length - this.offset
  }

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

  getAs<T extends DERTriplet>(...clazzes: DERFactory<T>[]): Nullable<T> {
    const triplet = this.get()

    if (triplet == null)
      return undefined

    for (const clazz of clazzes) {
      if (triplet instanceof clazz)
        return triplet as T

      if (triplet instanceof Opaque) {
        const resolved = triplet.readIntoOrNull(clazz)

        if (resolved != null)
          return resolved
        continue
      }
    }

    return undefined
  }

  getAsType<T extends DERTriplet>(type: Type.DER, ...clazzes: DERFactory<T>[]): Nullable<T> {
    const triplet = this.get()

    if (triplet == null)
      return undefined

    if (!triplet.type.equals(type))
      return undefined

    for (const clazz of clazzes) {
      if (triplet instanceof clazz)
        return triplet as T

      if (triplet instanceof Opaque) {
        const resolved = triplet.readIntoOrNull(clazz)

        if (resolved != null)
          return resolved
        continue
      }
    }

    return undefined
  }

  read() {
    const triplet = this.get()

    if (triplet != null)
      this.offset++

    return triplet
  }

  readAs<T extends DERTriplet>(...clazzes: DERFactory<T>[]): Nullable<T> {
    const triplet = this.getAs(...clazzes)

    if (triplet != null)
      this.offset++

    return triplet
  }

  readAsType<T extends DERTriplet>(type: Type.DER, ...clazzes: DERFactory<T>[]): Nullable<T> {
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

  readAsOrThrow<T extends DERTriplet>(...clazzes: DERFactory<T>[]): T {
    const triplet = this.readAs(...clazzes)

    if (triplet == null)
      throw new DERCursor.ReadError()

    return triplet
  }

  readAsTypeOrThrow<T extends DERTriplet>(type: Type.DER, ...clazzes: DERFactory<T>[]): T {
    const triplet = this.readAsType(type, ...clazzes)

    if (triplet == null)
      throw new DERCursor.ReadError()

    return triplet
  }

  subAs<T extends DERHolder>(clazz: DERFactory<T>): Nullable<DERCursor> {
    const triplet = this.readAs(clazz)

    if (triplet == null)
      return undefined

    return new DERCursor(triplet.triplets)
  }

  subAsType<T extends DERHolder>(type: Type.DER, ...clazzes: DERFactory<T>[]): Nullable<DERCursor> {
    const triplet = this.readAsType(type, ...clazzes)

    if (triplet == null)
      return undefined

    return new DERCursor(triplet.triplets)
  }

  subAsOrThrow<T extends DERHolder>(...clazzes: DERFactory<T>[]): DERCursor {
    return new DERCursor(this.readAsOrThrow(...clazzes).triplets)
  }

  subAsTypeOrThrow<T extends DERHolder>(type: Type.DER, ...clazzes: DERFactory<T>[]): DERCursor {
    return new DERCursor(this.readAsTypeOrThrow(type, ...clazzes).triplets)
  }

  resolveAsOrThrow<T>(resolvable: DERResolvable<T>): T {
    const struct = this.readAsOrThrow(resolvable.struct)
    const subcursor = new DERCursor(struct.triplets)
    return resolvable.resolveOrThrow(subcursor)
  }

  resolveAsTypeOrThrow<T>(type: Type.DER, resolvable: DERResolvable<T>): T {
    const struct = this.readAsTypeOrThrow(type, resolvable.struct)
    const subcursor = new DERCursor(struct.triplets)
    return resolvable.resolveOrThrow(subcursor)
  }

  resolveAs<T>(resolvable: DERResolvable<T>): Nullable<T> {
    const struct = this.readAs(resolvable.struct)

    if (struct == null)
      return undefined

    const subcursor = new DERCursor(struct.triplets)
    return resolvable.resolveOrThrow(subcursor)
  }

  resolveAsType<T>(type: Type.DER, resolvable: DERResolvable<T>): Nullable<T> {
    const struct = this.readAsType(type, resolvable.struct)

    if (struct == null)
      return undefined

    const subcursor = new DERCursor(struct.triplets)
    return resolvable.resolveOrThrow(subcursor)
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