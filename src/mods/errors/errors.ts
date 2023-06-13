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
    readonly typeByte: number
  ) {
    super(`Invalid type ${typeByte} for ${triplet}`)
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