import { Length } from "mods/length/length.js";
import { Type } from "mods/type/type.js";

export namespace Triplets {

  export function trySize(length: Length.DER) {
    const lengthSizeResult = length.trySize()

    if (lengthSizeResult.isErr())
      return lengthSizeResult

    return Type.DER.size() + lengthSizeResult.inner + length.inner.value
  }

}