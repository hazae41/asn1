
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