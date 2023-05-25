import { Class } from "libs/reflection/reflection.js"
import { Triplet } from "mods/triplets/triplet.js"

export type ASN1Error =
  | ASN1CastError
  | ASN1OverflowError

export class ASN1CastError extends Error {
  readonly #class = ASN1CastError
  readonly name = this.#class.name

  constructor(
    readonly triplet: Triplet,
    readonly clazzes: Class<unknown>[]
  ) {
    super(`Could not cast triplet to ${clazzes.map(clazz => clazz.name).join(",")}`)
  }

}

export class ASN1OverflowError extends Error {
  readonly #class = ASN1OverflowError
  readonly name = this.#class.name

  constructor() {
    super(`ASN1Cursor read overflow`)
  }

}