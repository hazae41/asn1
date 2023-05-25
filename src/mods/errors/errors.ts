import { Type } from "index.js"

export class Unimplemented extends Error {
  readonly #class = Unimplemented
  readonly name = this.#class.name

  constructor(
    readonly message: string
  ) {
    super(`Unimplemented: ${message}`)
  }
}

export class InvalidLengthError extends Error {
  readonly #class = InvalidLengthError
  readonly name = this.#class.name

  constructor(
    readonly triplet: string,
    readonly length: number
  ) {
    super(`Invalid length ${length} for ${triplet}`)
  }
}

export class InvalidTypeError extends Error {
  readonly #class = InvalidTypeError
  readonly name = this.#class.name

  constructor(
    readonly triplet: string,
    readonly type: Type
  ) {
    super(`Invalid type ${type.byte} for ${triplet}`)
  }
}

export class InvalidValueError extends Error {
  readonly #class = InvalidValueError
  readonly name = this.#class.name

  constructor(
    readonly triplet: string,
    readonly value: string
  ) {
    super(`Invalid value ${value} for ${triplet}`)
  }
}