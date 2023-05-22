import { Ok, Result } from "@hazae41/result";
import { Length } from "mods/length/length.js";
import { Type } from "mods/type/type.js";

export namespace Triplets {

  export function trySize(length: Length.DER): Result<number, never> {
    return new Ok(Type.DER.size + length.trySize().get() + length.value)
  }

}