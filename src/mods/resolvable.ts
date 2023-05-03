import { Result } from "@hazae41/result";
import { Opaque } from "./triplets/opaque/opaque.js";
import { Triplet } from "./triplets/triplet.js";

export interface Resolvable {
  tryResolve(opaque: Opaque): Result<Triplet, Error>
}