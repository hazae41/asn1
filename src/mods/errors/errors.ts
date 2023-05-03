import { Type } from "index.js"

export class Unimplemented extends Error {
  constructor(
    readonly message: string
  ) {
    super(`Unimplemented: ${message}`)
  }
}

export class InvalidLengthError extends Error {
  readonly #class = InvalidLengthError

  constructor(
    readonly name: string,
    readonly length: number
  ) {
    super(`Invalid length ${length} for ${name}`)
  }
}

export class InvalidTypeError extends Error {
  readonly #class = InvalidTypeError

  constructor(
    readonly name: string,
    readonly type: Type
  ) {
    super(`Invalid type ${type.byte} for ${name}`)
  }
}

export class InvalidValueError extends Error {
  readonly #class = InvalidValueError

  constructor(
    readonly name: string,
    readonly value: string
  ) {
    super(`Invalid value ${value} for ${name}`)
  }
}