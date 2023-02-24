import { Length } from "mods/length/length.js";
import { Type } from "mods/type/type.js";

export namespace Triplets {

  export function size(length: Length.DER) {
    return Type.DER.size() + length.size() + length.inner.value
  }

}