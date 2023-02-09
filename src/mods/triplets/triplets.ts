import { Length } from "mods/length/length.js";
import { Type } from "mods/type/type.js";

export namespace Triplets {

  export function size(length: Length) {
    return Type.size() + length.size() + length.value
  }

}